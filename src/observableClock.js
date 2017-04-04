import { Atom, runInAction } from 'mobx'
import { app } from '@mindhive/di'

// Based on the Atom example here: https://mobxjs.github.io/mobx/refguide/extending.html

const intervalSecondsAtomMap = {}

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

  current() {
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

const getTickAtom = (intervalSeconds) => {
  const mapKey = Number(intervalSeconds)
  const existingAtom = intervalSecondsAtomMap[mapKey]
  if (existingAtom) {
    return existingAtom
  }
  const newAtom = new TickAtom(intervalSeconds)
  intervalSecondsAtomMap[mapKey] = newAtom
  return newAtom
}

export default () => ({
  observableClock(intervalSeconds) {
    getTickAtom(intervalSeconds).current()
  }
})
