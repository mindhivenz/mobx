import React from 'react'
import shallowEqual from 'shallowequal'

/* eslint-disable no-console */

// REVISIT: should we be reactive to observable changes used in constructor?

export default ({
  storeClass,
  propName,
  mapPropsToArgs = props => undefined,                           // eslint-disable-line no-unused-vars
  createStore = props => new storeClass(mapPropsToArgs(props)),  // eslint-disable-line new-cap
  shouldRecreateStore = (currentProps, nextProps) =>
    ! shallowEqual(mapPropsToArgs(currentProps), mapPropsToArgs(nextProps)),
  updateStore = (store, props) => { if (typeof store.update === 'function') store.update(props) },
  stopStore = (store) => { if (typeof store.stop === 'function') store.stop() },
}) =>
  Component =>
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
        return React.createElement(Component, { ...this.props, [propName]: this.store })
      }
    }
