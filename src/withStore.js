import React from 'react'
import shallowEqual from 'recompose/shallowEqual'
import { observer } from 'mobx-react'
import fromPairs from 'lodash/fromPairs'

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
}) =>
  Component =>
    observer(
      class extends React.Component {

        static displayName = storeClass.name

        store = null

        componentWillMount() {
          this.store = createStore(this.props)
          updateStore(this.store, this.props)
        }

        componentWillReceiveProps(nextProps) {
          if (shouldRecreateStore(this.props, nextProps)) {
            stopStore(this.store)
            this.store = createStore(nextProps)
          }
          updateStore(this.store, nextProps)
        }

        componentWillUnmount() {
          if (this.store) {
            stopStore(this.store)
            this.store = null
          }
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
