import moment from "moment";

const twins = [
  // South America
  {
    type: "Factory",
    id: "CA44220",
    efficiency: 91,
    openorders: 54,
    reliability: 92,
    maxEfficiency: 75,
    maxReliability: 75,
    recentOrders: [
      {
        id: "447-6548",
        products: ["tee"],
        date: moment().subtract("1", "days").format("l"),
        status: "Confirmed",
      },
      {
        id: "497-14413",
        products: ["pants", "jacket"],
        date: moment().subtract("2", "days").format("l"),
        status: "Confirmed",
      },
      {
        id: "218-9162",
        products: ["pants", "jacket"],
        date: moment().subtract("3", "days").format("l"),
        status: "In Progress",
      },
      {
        id: "645-4984",
        products: ["tee", "jacket"],
        date: moment().subtract("4", "days").format("l"),
        status: "In Progress",
      },
    ],
    liveValues: [
      { title: "efficiency", max: 95, min: 85 },
      { title: "reliability", max: 93, min: 87 }
    ],
  },
  // Pakistan
  {
    type: "Factory",
    id: "CA44210",
    efficiency: 91,
    openorders: 63,
    reliability: 90,
    maxEfficiency: 75,
    maxReliability: 75,
    liveValues: [
      { title: "efficiency", max: 95, min: 85 },
      { title: "reliability", max: 92, min: 85 },
    ],
    recentOrders: [
      {
        id: "447-6548",
        products: ["jacket"],
        date: moment().subtract("1", "days").format("l"),
        status: "Confirmed",
      },
      {
        id: "497-14413",
        products: ["pants", "jacket"],
        date: moment().subtract("2", "days").format("l"),
        status: "Confirmed",
      },
      {
        id: "218-9162",
        products: ["pants", "jacket"],
        date: moment().subtract("3", "days").format("l"),
        status: "In Progress",
      },
      {
        id: "645-4984",
        products: ["tee", "jacket"],
        date: moment().subtract("4", "days").format("l"),
        status: "In Progress",
      },
    ],
  },
  // Atlantic Ocean
  {
    type: "Shipment",
    id: "CA44901-22",
    humidity: 63,
    status: "On time",
    estimatedtimeofarrival: moment().add("5", "days").add("3", "hours"),
    location: "39.5771, -40.1922",
    temperature: 86.4,
    vibration: 71.8,
    maxHumidity: 75,
    minHumidity: 25,
    liveValues: [
      { title: "temperature", max: 90, min: 82 },
      { title: "humidity", max: 70, min: 60 },
      { title: "vibration", max: 75, min: 65 },
    ],
  },
  // Indian Ocean
  {
    type: "Shipment",
    id: "CA91134-88",
    humidity: 63,
    status: "On time",
    estimatedtimeofarrival: moment().add("5", "days").add("9", "hours"),
    location: "-24.3927, 76.8506",
    temperature: 86.4,
    vibration: 71.8,
    maxHumidity: 75,
    minHumidity: 25,
    liveValues: [
      { title: "temperature", max: 90, min: 82 },
      { title: "humidity", max: 70, min: 60 },
      { title: "vibration", max: 75, min: 65 },
    ],
  },
  // US
  {
    type: "Retail",
    id: "CA4465879",
    stock: "$127,144.00",
    openOrders: 15,
    impactedOrders: 4,
    impactedStock: "$20,210.00",
    recentOrders: [
      {
        id: "891-14437",
        products: ["jacket"],
        lot: "A6551, B7845, C8418, D1562",
        progress: 10,
        estimatedtimeofarrival: moment().add("1", "days").format("l"),
        impacted: true
      },
      {
        id: "497-14413",
        products: ["pants", "jacket"],
        lot: "A6550, B7844",
        progress: 25,
        estimatedtimeofarrival: moment().add("2", "days").format("l"),
        impacted: true
      },
      {
        id: "442-13393",
        products: ["shoe"],
        lot: "A6549, C8417, D1561",
        progress: 53,
        estimatedtimeofarrival: moment().add("2", "days").format("l"),
        impacted: true
      },
      {
        id: "118-13376",
        products: ["jacket", "hat"],
        lot: "A6548, C8416",
        progress: 80,
        estimatedtimeofarrival: moment().add("3", "days").format("l"),
        impacted: true
      },
      {
        id: "442-12448",
        products: ["tee"],
        lot: "B7843",
        progress: 100,
        canSelect: true,
        estimatedtimeofarrival: moment().add("3", "days").format("l"),
        details: [
          {
            title: "Signature Tee",
            text: "Color: green  Units: 280  Size: XXL",
            progress: 100,
          },
          {
            title: "Signature Tee",
            text: "Color: green  Units: 320  Size: XL",
            progress: 100,
          },
          {
            title: "Signature Tee",
            text: "Color: green   Units: 800  Size: L",
            progress: 100,
          },
          {
            title: "Signature Tee",
            text: "Color: green   Units: 680   Size: M",
            progress: 100,
          },
          {
            title: "Signature Tee",
            text: "Color: green   Units: 280   Size: S",
            progress: 100,
          },
        ],
      },
    ],
  },
  // UK
  {
    type: "Retail",
    id: "CA4461698",
    stock: "$127,144.00",
    openOrders: 15,
    impactedOrders: 3,
    impactedStock: "$12,210.00",
    recentOrders: [
      {
        id: "764-65788",
        products: ["tee"],
        estimatedtimeofarrival: moment().add("1", "days").format("l"),
        impacted: true
      },
      {
        id: "545-76555",
        products: ["pants", "jacket"],
        estimatedtimeofarrival: moment().add("2", "days").format("l"),
        impacted: true
      },
      {
        id: "442-65855",
        products: ["shoe"],
        estimatedtimeofarrival: moment().add("2", "days").format("l")
      },
      {
        id: "122-65665",
        products: ["jacket", "hat"],
        estimatedtimeofarrival: moment().add("3", "days").format("l"),
        impacted: true
      }
    ]
  }
];

const factoryLines = [
  {
    id: 1,
    assets: [
      {
        type: "Storeroom",
        id: "CA81447",
        temperature: 58,
        humidity: 62,
        minHumidity: 25,
        maxHumidity: 75,
        minTemperature: 25,
        maxTemperature: 75,
        liveValues: [
          { title: "temperature", max: 60, min: 55 },
          { title: "humidity", max: 65, min: 55 }
        ],
        hitboxPosition: {
          top: "5%",
          left: "36%",
        },
        popupPosition: {
          top: "2.5%",
          left: "40.5%",
        },
      },
      {
        type: "Cutter",
        id: "CA-4418",
        speed: 45,
        minSpeed: 25,
        maxSpeed: 75,
        liveValues: [{ title: "speed", max: 50, min: 40 }],
        hitboxPosition: {
          top: "23%",
          left: "51%",
        },
        popupPosition: {
          top: "20.5%",
          left: "55.3%",
        },
      },
      {
        type: "Conveyor",
        id: "CA90372",
        speed: 66,
        minSpeed: 25,
        maxSpeed: 75,
        liveValues: [{ title: "speed", max: 70, min: 60 }],
        hitboxPosition: {
          top: "40%",
          left: "68%",
        },
        popupPosition: {
          top: "38%",
          left: "72.5%",
        },
      },
    ],
  },
  {
    id: 2,
    assets: [
      {
        type: "Storeroom",
        id: "CA81447",
        temperature: 57,
        humidity: 60,
        minTemperature: 25,
        maxTemperature: 75,
        minHumidity: 25,
        maxHumidity: 75,
        liveValues: [
          { title: "temperature", max: 60, min: 55 },
          { title: "humidity", max: 65, min: 55 }
        ],
        hitboxPosition: {
          top: "14%",
          left: "27%",
        },
        popupPosition: {
          top: "11.5%",
          left: "31.5%",
        },
      },
      {
        type: "Cutter",
        id: "CA-4418",
        speed: 40,
        minSpeed: 25,
        maxSpeed: 75,
        liveValues: [{ title: "speed", max: 45, min: 30 }],
        hitboxPosition: {
          top: "31%",
          left: "42%",
        },
        popupPosition: {
          top: "28.5%",
          left: "46.3%",
        },
      },
      {
        type: "Conveyor",
        id: "CA90372",
        speed: 48,
        minSpeed: 25,
        maxSpeed: 75,
        liveValues: [{ title: "speed", max: 50, min: 45 }],
        hitboxPosition: {
          top: "49%",
          left: "59%",
        },
        popupPosition: {
          top: "47%",
          left: "63.5%",
        },
      },
    ],
  },
  {
    id: 3,
    isFaulty: true,
    assets: [
      {
        type: "Storeroom",
        id: "CA81447",
        temperature: 87,
        humidity: 92,
        minHumidity: 25,
        maxHumidity: 75,
        minTemperature: 25,
        maxTemperature: 75,
        liveValues: [
          { title: "temperature", max: 90, min: 85 },
          { title: "humidity", max: 95, min: 89 }
        ],
        hitboxPosition: {
          top: "24%",
          left: "17%",
        },
        popupPosition: {
          top: "21.9%",
          left: "20.9%",
        },
      },
      {
        type: "Cutter",
        id: "CA-4418",
        speed: 64,
        minSpeed: 25,
        maxSpeed: 75,
        liveValues: [{ title: "speed", max: 65, min: 60 }],
        hitboxPosition: {
          top: "41%",
          left: "33%",
        },
        popupPosition: {
          top: "40.5%",
          left: "36.9%",
        },
      },
      {
        type: "Conveyor",
        id: "CA90372",
        speed: 58,
        minSpeed: 25,
        maxSpeed: 75,
        liveValues: [{ title: "speed", max: 60, min: 55 }],
        hitboxPosition: {
          top: "58%",
          left: "49%",
        },
        popupPosition: {
          top: "55.9%",
          left: "52.8%",
        },
      },
    ],
  },
  {
    id: 4,
    assets: [
      {
        type: "Storeroom",
        id: "CA81447",
        temperature: 59,
        humidity: 62,
        minTemperature: 25,
        maxTemperature: 75,
        minHumidity: 25,
        maxHumidity: 75,
        liveValues: [
          { title: "temperature", max: 60, min: 55 },
          { title: "humidity", max: 65, min: 55 }
        ],
        hitboxPosition: {
          top: "33%",
          left: "8%",
        },
        popupPosition: {
          top: "30.7%",
          left: "12.5%",
        },
      },
      {
        type: "Cutter",
        id: "CA-4418",
        speed: 48,
        minSpeed: 25,
        maxSpeed: 75,
        liveValues: [{ title: "speed", max: 50, min: 45 }],
        hitboxPosition: {
          top: "51%",
          left: "23%",
        },
        popupPosition: {
          top: "48.5%",
          left: "27.5%",
        },
      },
      {
        type: "Conveyor",
        id: "CA90372",
        speed: 52,
        minSpeed: 25,
        maxSpeed: 75,
        liveValues: [{ title: "speed", max: 55, min: 50 }],
        hitboxPosition: {
          top: "67%",
          left: "40%",
        },
        popupPosition: {
          top: "64.5%",
          left: "44.5%",
        },
      },
    ],
  },
];

export class ADT {

  getTwin(id) {
    return twins.filter(t => t.id === id)[0];
  }

  getFactoryData() {
    return factoryLines;
  }

}
