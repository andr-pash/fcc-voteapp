const canvasCollection = $('.thumbnail-canvas').toArray()

canvasCollection.map( el => {
  const hashId = el.dataset.hash
  $.ajax({
    url: `/api/poll/${hashId}`,
    method: 'GET'
  })
    .done( function(pollData) {

      let data = {
        labels: pollData.labels,
        datasets: [{
          label: 'Votes',
          data: pollData.counts,
          backgroundColor: "rgb(255, 250, 184)"
        }]
      }

      let options = {
        scales: {
          yAxes: [{
            display: false,
            gridLines: {
              display: false
            }
          }],
          xAxes: [{
            display: false,
            gridLines: {
              display: false
            }
          }]
        },
        legend: {
          display: false
        },
        animation: {
          duration: 0
        }
      }

      let chart = new Chart(el, {
        type: 'pie',
        data: data,
        options: options
        })
  })

})
