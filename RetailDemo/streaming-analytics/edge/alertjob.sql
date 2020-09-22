WITH startbuffer AS (
         SELECT System.Timestamp() AS timestamp, MIN(grocery_items) AS GroceryItems, COUNT(*) AS count
         FROM deviceinput
         WHERE grocery_items < 4
         GROUP BY TUMBLINGWINDOW(s, 10)
     ),
     startbase AS (
         SELECT timestamp, GroceryItems
         FROM startbuffer
         WHERE ISFIRST(s, 30) OVER (WHEN count > 2) = 1
     ),
     endbuffer AS (
         SELECT System.Timestamp() AS timestamp, MAX(grocery_items) AS GroceryItems, COUNT(*) AS count
         FROM deviceinput
         GROUP BY TUMBLINGWINDOW(s, 10)
     ),
     endbase AS (
         SELECT timestamp, GroceryItems, count
         FROM endbuffer
         WHERE GroceryItems >= 4 AND LAG(GroceryItems) OVER (LIMIT DURATION(second, 60)) < 4
     )

     SELECT 'alert' AS message_type, 'start' AS event_type, timestamp, GroceryItems AS count
     INTO alertstart
     FROM startbase

     SELECT 'alert' AS message_type, 'end' AS event_type, timestamp, GroceryItems AS count
     INTO alertend
     FROM endbase
