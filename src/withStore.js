import React from 'react'
import shallowEqual from 'recompose/shallowEqual'
import { observer } from 'mobx-react'
import fromPairs from 'lodash/fromPairs'
import global from 'global'

// REVISIT: be reactive to observable changes used in constructor?

export default ({
  storeClass,
  propName = undefined,
  mapPropsToArgs = props => undefined,                           // eslint-disable-line no-unused-vars
  storePropsToPush = ['loading', 'error'],
  createStore = props => new storeClass(mapPropsToArgs(props)),  // eslint-disable-line new-cap
  shouldRecreateStore = (currentProps, nextProps) =>
    ! shallowEqual(mapPropsToArgs(currentProps), mapPropsToArgs(nextProps)),
  updateStore = (store, props) => { if (typeof store.update === 'function') store.update(props) },
  stopStore = (store) => { if (typeof store.stop === 'function') store.stop() },
  exposeAsGlobal = undefined,
}) =>
  Component =>
    observer(
      class extends React.Component {

        static displayName = storeClass.name

        store = null

        create(props) {
          this.store = createStore(props)
          updateStore(this.store, props)
          if (exposeAsGlobal) {
            global[exposeAsGlobal] = this.store
          }
        }

        stop() {
          if (this.store) {
            stopStore(this.store)
            if (exposeAsGlobal && global[exposeAsGlobal] === this.store) {
              global[exposeAsGlobal] = null
            }
            this.store = null
          }
        }

        componentWillMount() {
          this.create(this.props)
        }

        componentWillReceiveProps(nextProps) {
          if (shouldRecreateStore(this.props, nextProps)) {
            this.stop()
            this.create(nextProps)
          } else {
            updateStore(this.store, nextProps)
          }
        }

        componentWillUnmount() {
          this.stop()
        }

        render() {
          const pushProps = {
            ...this.props,
            ...fromPairs((storePropsToPush || []).map(p => [p, this.store[p]])),
          }
          if (propName) {
            pushProps[propName] = this.store
          }
          return React.createElement(Component, pushProps)
        }
      }
    )
