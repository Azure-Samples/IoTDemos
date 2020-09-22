WITH startbuffer AS (
         SELECT System.Timestamp() AS timestamp, MAX(forklift) AS Forklift, COUNT(*) AS count, bloburl AS BlobUrl
         FROM deviceinput
         WHERE forklift > 0
         GROUP BY TUMBLINGWINDOW(s, 10), bloburl
     ),
     startbase AS (
         SELECT timestamp, Forklift, BlobUrl
         FROM startbuffer
         WHERE ISFIRST(s, 10) OVER (WHEN count > 5) = 1
     ),
     endbuffer AS (
         SELECT System.Timestamp() AS timestamp, MAX(forklift) AS Forklift, COUNT(*) AS count, bloburl AS BlobUrl
         FROM deviceinput
         GROUP BY TUMBLINGWINDOW(s, 10), bloburl
     ),
     endbase AS (
         SELECT timestamp, Forklift, count, BlobUrl
         FROM endbuffer
         WHERE Forklift = 0 AND LAG(Forklift) OVER (LIMIT DURATION(second, 60)) > 0
     )

     SELECT 'alert' AS message_type, 'start' AS event_type, BlobUrl AS blob_url, timestamp, Forklift AS count
     INTO alertstart
    FROM startbase

     SELECT 'alert' AS message_type, 'end' AS event_type, BlobUrl AS blob_url, timestamp, Forklift AS count
     INTO alertend
     FROM endbase
