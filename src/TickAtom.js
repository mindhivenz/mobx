import { Atom, runInAction } from 'mobx'
import { app } from '@mindhive/di'

// Based on the Atom example here: https://mobxjs.github.io/mobx/refguide/extending.html

class TickAtom {
  intervalSeconds
  debugName
  atom
  intervalHandle = null
  currentTick

  constructor(intervalSeconds) {
    this.intervalSeconds = intervalSeconds
    this.debugName = `Tick every ${intervalSeconds}s`
    this.atom = new Atom(
      this.debugName,
      this.startTicking,
      this.stopTicking,
    )
  }

  getCurrent = () => {
    if (! this.atom.reportObserved()) {
      console.warn('Observable time requested outside of any observer')   // eslint-disable-line no-console
      return app().clock()
    }
    return this.currentTick
  }

  tick = () => {
    this.currentTick = app().clock()
    runInAction(this.debugName, () => { this.atom.reportChanged() })
  }

  startTicking = () => {
    this.tick()
    this.intervalHandle = setInterval(this.tick, this.intervalSeconds * 1000)
  }

  stopTicking = () => {
    clearInterval(this.intervalHandle)
    this.intervalHandle = null
  }
}

class ClockObservable {
  _perMinute = new TickAtom(60)

  get perMinute() {
    return this._perMinute.getCurrent()
  }
}

export default () => ({
  clockObservable: new ClockObservable(),
})
