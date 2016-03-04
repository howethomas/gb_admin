Template.botSettings.events
  'click .submit' : (e, tmpl) ->
    e.preventDefault()
    botId = Router.current().params.botId
    inputs = tmpl.$('input').each (index, element) ->
      name = $(this).prop('name')
      value = $(this).prop('value')
      Meteor.call('updateSetting', botId, name, value)
    return

Template.botSettings.helpers
  script: ->
    script = Scripts.findOne(@scriptId)
    script
  settings: ->
    this.settings

Template.botSettings.onRendered ->
  this.$('#settings').addClass('green')

Router.route '/bot/:botId/settings',
  name: 'botSettings'
  waitOn: ->
    Meteor.subscribe "bots"
    Meteor.subscribe "networkHandles", this.params._id
    Meteor.subscribe "sessions", this.params.botId
  data: ->
    return Bots.findOne this.params.botId
  action: ->
    this.render 'botSettings'
