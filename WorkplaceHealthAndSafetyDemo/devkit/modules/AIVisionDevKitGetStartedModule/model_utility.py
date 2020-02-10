import json
import os
from pathlib import Path
from shutil import copyfile
import socket
import subprocess as sp
import time
import urllib.request as urllib2
from urllib.request import urlopen
from zipfile import ZipFile
from .error_utils import log_unknown_exception

VAM_MODEL_DIR = "/app/vam_model_folder"
CONFIG_FILE_NAME = "va-snpe-engine-library_config.json"
MODEL_FILE_EXTENSIONS = ["dlc", "tflite", "tflit"]


class ModelUtility:
    def __init__(self):
        pass

    def replace_model_files(self, model_url):
        file_name = self.__get_file_name(model_url)
        if file_name is None:
            return False

        print("Clean up model folder.")
        self.__prepare_target_folder(VAM_MODEL_DIR)

        dest_dir = os.path.abspath(VAM_MODEL_DIR)
        dest_file_name = os.path.join(dest_dir, file_name)
        print("Downloading file: %s" % file_name)
        urllib2.urlretrieve(model_url, dest_file_name)
        self.__wait_for_file_download(dest_file_name)

        print("Unzip the model files.")
        self.__unzip_model_file(dest_file_name, dest_dir)

    def restart_service(self, service_name):
        self.__call_system_command("systemctl restart %s" % service_name)
        time.sleep(1)

    def restart_device(self):
        self.__call_system_command("systemctl reboot")

    # this function returns the device ip address if it is public ip else 127.0.0.1
    def getWlanIp(self):
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        try:
            # doesn't even have to be reachable
            s.connect(("10.255.255.255", 1))
            ip_address = s.getsockname()[0]
            print("Found IP: %s" % ip_address)
            if ip_address.split(".")[0] == "172":
                ip_address = "172.17.0.1"
                print("IP set to: %s to avoid docker interface" % ip_address)

        except Exception as ex:
            log_unknown_exception("Error retrieving IP address: %s" % ex)
            ip_address = "172.17.0.1"
        finally:
            s.close()
        return ip_address

    def transfer_dlc(self, force_update=False):
        if self.__check_model_exists() and not force_update:
            print("Model already present and force update set to false")
            return

        self.__prepare_target_folder(VAM_MODEL_DIR)

        for file_name in self.__get_model_files():
            print("Transfering file %s" % file_name)
            str_file = str(file_name)
            file_dest = os.path.join(VAM_MODEL_DIR, os.path.basename(str_file))
            print("File destination: %s" % file_dest)
            copyfile(str(str_file), file_dest)

    def restart_camera(self, camera_client=None):
        try:
            self.restart_device()
            print("Turning camera off and log out")
            if camera_client is not None:
                camera_client.logout()
                camera_client = None
            self.restart_service("qmmf-webserver")
            self.restart_service("ipc-webserver")
        except Exception:
            log_unknown_exception(
                "Camera restart failed. Please restart the device.")

    def __call_system_command(self, cmd):
        print("Sending command: %s" % cmd)
        returnedvalue = sp.call(cmd, shell=True)
        print("Returned value is: %s" % str(returnedvalue))

    def __check_model_exists(self):
        for extension in MODEL_FILE_EXTENSIONS:
            if len(list(Path("/app/vam_model_folder").glob("*.%s" % extension))) > 0:
                return True
        print("No dlc or tflite model on device")
        return False

    def __find_file(self, input_path, file_name):
        # search the input path and all sub-directories for file_name
        selected_files = list(Path(input_path).glob("**/%s" % file_name))

        if len(selected_files) != 1:
            print("Expected 1 file %s in %s but got %s" %
                  (file_name, input_path, selected_files))
            return
        return selected_files[0]

    def __get_file_name(self, model_url):
        remote_file = urlopen(model_url)
        remote_file_url = remote_file.url
        split_url = remote_file_url.split("/")

        if not split_url:
            print("Cannot extract file name from URL: %s" % remote_file_url)
            return None

        return split_url[-1]

    def __get_model_files(self):
        model_src_dir = os.path.join(os.getcwd(), "model")
        config_file = self.__find_file(model_src_dir, CONFIG_FILE_NAME)
        with open(str(config_file)) as cfg:
            config = json.load(cfg)

        dlc_file = self.__find_file(model_src_dir, config["DLC_NAME"])
        label_file = self.__find_file(model_src_dir, config["LABELS_NAME"])

        return [config_file, dlc_file, label_file]

    def __prepare_target_folder(self, folder):
        if (not os.path.isdir(folder)):
            os.makedirs(folder, exist_ok=True)
            return

        for file in Path(folder).glob("*"):
            str_file = str(file)
            # ignore the debugging file
            if "aecWarm" in str_file:
                continue
            print("Deleting file %s..." % str_file)
            os.chmod(str_file, 0o777)
            os.remove(str_file)

    def __unzip_model_file(self, zip_file, destination):
        print("Extract from file: %s" % zip_file)
        with ZipFile(zip_file, 'r') as archive:
            archive.extractall(destination)

    def __wait_for_file_download(self, file_name):
        valid = 0
        while valid == 0:
            try:
                with open(file_name):
                    valid = 1
            except IOError:
                time.sleep(1)
        print("File download is complete!")
