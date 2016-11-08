const bigCanvas = document.getElementById('big-canvas')
if (bigCanvas) {

  const dataObj = {};
  let chart;

  const url = `/api${window.location.pathname}`

  $.ajax({
    url,
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
            ticks: {
              min: 0
            },
            gridLines: {
              display: false
            }
          }]
        },
        legend: {
          display: false
        }
      }

      chart = new Chart(bigCanvas, {
        type: 'bar',
        data: data,
        options: options
        })

      const optionsForm = $('.options').first()
      updateOptions(optionsForm, pollData)


      $('#submit-vote').click( function() {
        let answerId;
        let radioBtns = document.querySelectorAll('input[name="options"]')

        radioBtns.forEach( function(el) {
          if (el.checked)
            answerId = el.value
            el.checked = false
        })

        if (answerId) {
          $.ajax({
            method: 'POST',
            url: '/api/addVote',
            data: {
              answerId,
              hashId: pollData.hashId
            }
          })
          .done( (pollData) => {
              updateChart(chart, pollData)
          })
        }
      })


      $('#submit-option').click( function (evt) {
        evt.preventDefault()
        let optionInputField = $('#add-opton-input')
        const optionName = optionInputField.val()

        $.ajax({
          url: '/api/addOption',
          method: 'POST',
          data: {
            optionName,
            hashId: pollData.hashId
          }
          })
          .done( function (pollData) {

            updateChart(chart, pollData)
            updateOptions(optionsForm, pollData)
            optionInputField.val('')

          })
      })

      $('#delete-poll').click( function () {
        $.ajax({
          url: '/api/deletePoll',
          method: 'POST',
          data: {
            hashId: pollData.hashId
          }
        })
        .done( function() {
          window.location = '/'
        })
      })



    })



    function updateChart (chart, pollData) {
      let newData = pollData.counts
      let newLabels = pollData.labels

      chart.data.datasets[0].data = newData
      chart.data.labels = newLabels
      chart.update()
    }


    function updateOptions (parent, data) {

      parent.empty()

      data.labels.map( (el, index) => {
        parent.append( `
          <div>
            <input
              type="radio"
              name="options"
              id="option${index + 1}"
              value=${index}
            />
            <label for="option${index + 1}">${el}</label>
          </div>
          `)
      })
    }





}
