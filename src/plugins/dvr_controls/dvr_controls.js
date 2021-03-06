var UICorePlugin = require('../../base/ui_core_plugin')
var template = require('../../base/template')
var Styler = require('../../base/styler')
var Events = require('../../base/events')
var dvrStyle = require('./public/dvr_controls.scss')
var dvrHTML = require('./public/index.html')
var $ = require('clappr-zepto')

class DVRControls extends UICorePlugin {
  get template() { return template(dvrHTML) }
  get name() { return 'dvr_controls' }
  get events() {
    return {
      'click .live-button': 'click'
    }
  }
  get attributes() {
    return {
      'class': 'dvr-controls',
      'data-dvr-controls': '',
    }
  }

  constructor(core) {
    super(core)
    this.core = core
    this.settingsUpdate()
  }

  bindEvents() {
    this.listenTo(this.core.mediaControl, Events.MEDIACONTROL_RENDERED, this.settingsUpdate)
    this.listenTo(this.core.mediaControl.container, Events.CONTAINER_PLAYBACKDVRSTATECHANGED, this.dvrChanged)
  }

  dvrChanged(dvrEnabled) {
    this.settingsUpdate()
    this.core.mediaControl.$el.addClass('live')
    if (dvrEnabled) {
      this.core.mediaControl.$el.addClass('dvr')
      this.core.mediaControl.$el.find('.media-control-indicator[data-position], .media-control-indicator[data-duration]').hide()
    } else {
      this.core.mediaControl.$el.removeClass('dvr')
    }
  }

  click() {
    if (!this.core.mediaControl.container.isPlaying()) {
      this.core.mediaControl.container.play()
    }
    if (this.core.mediaControl.$el.hasClass('dvr')) {
      this.core.mediaControl.container.setCurrentTime(-1)
    }
  }

  settingsUpdate() {
    this.stopListening()
    if(this.shouldRender()) {
      this.render()
      this.$el.click(() => this.click())
    }
    this.bindEvents()
  }

  shouldRender() {
    var useDvrControls = this.core.options.useDvrControls === undefined || !!this.core.options.useDvrControls
    return useDvrControls && this.core.mediaControl.container.getPlaybackType() === 'live'
  }

  render() {
    this.style = this.style || Styler.getStyleFor(dvrStyle, { baseUrl: this.core.options.baseUrl })

    this.$el.html(this.template())
    this.$el.append(this.style)
    if (this.shouldRender()) {
      this.core.mediaControl.$el.addClass('live')
      this.core.mediaControl.$('.media-control-left-panel[data-media-control]').append(this.$el)
      if (!this.$duration) {
        this.$duration = $('<span data-duration></span>')
      }
      this.$duration.html('')
      this.core.mediaControl.seekTime.$el.append(this.$duration)
    }
    return this
  }
}

module.exports = DVRControls
