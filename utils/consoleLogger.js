var irsdk = require('../')

var iracing = irsdk.getInstance()

console.log('\nwaiting for iRacing...')

iracing.on('Connected', function () {
  console.log('Connected to iRacing.')

  iracing.once('Disconnected', function () {
    console.log('iRacing shut down.')
    process.exit()
  })

  let DriverNames = [];

  iracing.once('SessionInfo', function (sessionInfo) {
    console.log('SessionInfo event received\n');
    sessionInfo.data.DriverInfo.Drivers.forEach(Driver => {
      DriverNames.push({
        "Idx": Driver.CarIdx,
        "Name": Driver.UserName,
        "CarNumber": Driver.CarNumber,
        "CarName": Driver.CarScreenNameShort,
        "IRating": Driver.IRating,
        "LicenceString": Driver.LicString,
        "PaceCar": Driver.CarIsPaceCar
      });
    });
    iracing.emit("SessionReady");
    console.log(DriverNames)
  });
  iracing.on('SessionReady', () => {


    iracing.on('Telemetry', function (data) {
      console.clear()
      const vals = {}
      var positions = []

      data.values.CarIdxPosition.forEach((x, y) => {
        let timeFromCheck = data.values.CarIdxEstTime[y].toFixed(2)
        let lap = data.values.CarIdxLap[y]

        let current = false
        if (data.values.PlayerCarIdx === y) {
          current = true
        }

        if (x !== 0) {
          const Name = DriverNames[y] ? DriverNames[y].Name : 'xxx'
          const iRating = DriverNames[y] ? `${DriverNames[y].IRating / 100}k` : 'xxx'
          const Licence = DriverNames[y] ? DriverNames[y].LicenceString : 'xxx'
          positions.push({
            Name: Name,
            Licence: Licence,
            iRating: iRating,
            TrackPosition: x,
            lap: lap !== -1 ? lap : 'PITS',
            me: current
          })
        }

        vals[x] = [lap, timeFromCheck]
        if (data.values.PlayerCarIdx === y) {
          vals[x].push(current)
        }
      })

      positions = positions.sort((x, y) => {
        return x.TrackPosition - y.TrackPosition
      })

      console.table(positions)
    })
  })
})

// PUT ASIDE

// let delta = (data.values.CarIdxEstTime[y].toFixed(2) - data.values.CarIdxEstTime[data.values.PlayerCarIdx].toFixed(2)).toFixed(2)
// lapTime: timeFromCheck,
// delta: delta,