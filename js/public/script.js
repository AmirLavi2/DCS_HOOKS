// make connection
const socket = io.connect('http://localhost:8000');
let myMarker;
let mrk = [];
let myData;

function newIcon(iconName) {
    return new L.icon({
        iconUrl: 'icons/'+iconName,
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    })
}

const iconGrey = newIcon('marker-icon-grey.png')
const iconRed = newIcon('fighter-red - small.png')
const iconClient = newIcon('attack-blue2.png')
const iconCar = newIcon('car.png')
const iconBlue = newIcon('fighter-blue-2-small.jpg')
const iconSquare = newIcon('car.png')
const iconShip = newIcon('ship.png')
const iconMissile = newIcon('missile.png')
const iconBomb = newIcon('bomb.jpg')

socket.on('chat', function (data) {
    // console.log('socket.on chat -> data:\n', data)
    myData = data;

    // });

    // setInterval(function () {
    for (const [key, value] of Object.entries(mrk)) {

        if (myData[key] == undefined) {
            mrk[key].remove();
            // delete mrk.key;
            delete mrk[key];
        }
        // console.log(myData[key]);
    }

    if (myData && Object.keys(myData).length !== 0) {
        let i = 0;
        for (const [key, value] of Object.entries(myData)) {


            let popupData = '';

            // ----- name ----
            if (value.Flags.Human) popupData = value.UnitName;
            else if (value.GroupName) popupData = value.GroupName;
            else popupData = value.Name

            // ----- N / lat coord ----
            let latInt = parseInt(value.LatLongAlt.Lat)
            let latDec = (value.LatLongAlt.Lat - latInt)
            let addZeroN = ''
            latDec = parseInt(latDec * 100000) * 60
            latDec = latDec / 100000
            if (latDec < 10) addZeroN = 0
            popupData += ` N${latInt}°${addZeroN}${latDec.toFixed(3)}`

            // ----- E / long coord ----
            let longInt = parseInt(value.LatLongAlt.Long)
            let longDec = (value.LatLongAlt.Long - longInt)
            let addZeroE = ''
            longDec = parseInt(longDec * 100000) * 60
            longDec = Math.round(longDec / 100)
            longDec = longDec / 1000
            if (longDec < 10) addZeroE = 0
            popupData += ` E${longInt}°${addZeroE}${longDec.toFixed(3)} `

            // ----- ft / alt ----
            altFeet = value.LatLongAlt.Alt / 0.3048 // convert meter to feet
            popupData += parseInt(altFeet) + 'ft'

            // ----- radians to degrees ----
            let deg = Math.round(value.Heading * 180 / Math.PI)
            popupData += ' ' + deg + '°'

            // console.log(popupData);
            if (mrk[key] == undefined) {

                let theIcon = iconGrey;

                if (value.CoalitionID == 1) theIcon = iconRed;
                if (value.CoalitionID == 2) theIcon = iconBlue;
                

                switch (value.Type.level1) {
                    case 1:
                        theIcon = iconBlue;
                        break;
                    case 2: 
                        // theIcon = iconCar;
                        break;
                    case 3: 
                        theIcon = iconShip;
                        break;
                    case 4: 
                        if (value.Type.level2 == 4) theIcon = iconMissile
                        else theIcon = iconBomb
                        break;
                    case 5: 
                        // theIcon = iconBomb;
                        break;
                    default: theIcon = iconSquare;

                }
                
                if (value.Flags.Human) theIcon = iconClient;

                mrk[key] = L.marker([value.LatLongAlt.Lat, value.LatLongAlt.Long], { icon: theIcon, rotationAngle: deg })
                    .bindPopup(popupData) //.bindPopup(value.Name)
                    .openPopup()
                    .addTo(map);
            } else {
                mrk[key].setLatLng([value.LatLongAlt.Lat, value.LatLongAlt.Long]);
                mrk[key].setPopupContent(popupData)
            }
        }
    }

    // }, 1);
});

const map = L.map('map').setView([42.24, 42.33], 11);

const CyclOSM = L.tileLayer('https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', {
    maxZoom: 20,
    attribution: '<a href="https://github.com/cyclosm/cyclosm-cartocss-style/releases" title="CyclOSM - Open Bicycle render">CyclOSM</a> | Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

CyclOSM.addTo(map)