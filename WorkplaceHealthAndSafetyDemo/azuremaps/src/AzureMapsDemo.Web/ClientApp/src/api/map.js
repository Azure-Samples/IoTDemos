export const getConfig = async () => {
  const res = await fetch("/api/config");
  return await res.json();
};

export const getUsersLocations = async () => {
  const res = await fetch("/api/locations");
  return await res.json();
};

export const registerUser = async (id, name, lat, lon) => {
  const payload = {
    "Id": id,
    "Name": name,
    "Latitude": lat,
    "Longitude": lon
  };
  const res = await fetch('/api/users', {
    method: 'post',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(payload)
  });
  return res.ok;
}

export const updateUserGeolocation = async (userId, direction) => {
  const payload = {
    "Direction": direction
  };
  const res = await fetch(`/api/users/${userId}/location`, {
    method: 'put',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(payload)
  });
  return res.ok;
}

export const userExists = async (userId) => {
  const res = await fetch(`/api/users/${userId}`);
  return await res.json();
};

export const removeUser = async (userId) => {
  const res = await fetch(`/api/users/${userId}`, {
    method: 'delete'
  });
  return res.ok;
}

export const createGeofence = async (coordinates) => {
  const payload = {
    "Coordinates": coordinates
  };
  const res = await fetch('/api/geofence', {
    method: 'post',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(payload)
  });
  return res.ok;
}

export const getGeofence = async () => {
  const res = await fetch('/api/geofence');
  if (res.ok) {
    return await res.json();
  } else {
    return false;
  }
};


