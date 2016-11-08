

const form = document.getElementById('create-poll-form')

if (form) {

  // form is turned into jquery object for easier handling
  const $form = $(form)
  const btnCreatePoll = $('#btn-create-poll')
  let optionIndex = 0

  for (let i = 0; i < 3; i++) {
    createNewOptionField()
  }


  btnCreatePoll.click( () => {
    const newPoll = createPollObject()
    submitPollObject(newPoll)
  })



  function createNewOptionField() {

    $form.children().last().unbind()
    optionIndex++

    $form.append(`
      <input
        type="text"
        name="option"
        placeholder="Option ${ optionIndex }"
      />
      `)

    const newOption = $form.children().last()

    newOption.on('focusin', function() {
      createNewOptionField()
    })
  }

  function createPollObject() {
    const title = $('input[name="title"]').val()
    const options = $('input[name="option"]').toArray().map( el => el.value )
    return { title, options }

  }

  function submitPollObject(obj) {
    $.ajax({
      type: 'POST',
      url: '/api/createPoll',
      data: obj,
      dataType: 'json',
      success: function(data) {
        window.location = data.pollAddress
      }
    })

  }
}
