import { Component } from 'react'
import setDisplayName from 'recompose/setDisplayName'
import wrapDisplayName from 'recompose/wrapDisplayName'
import createEagerFactory from 'recompose/createEagerFactory'
import fromPairs from 'lodash/fromPairs'

import { app } from '@mindhive/di'

export default domains => (BaseComponent) => {
  const factory = createEagerFactory(BaseComponent)

  class Inject extends Component {

    render() {
      return factory({
        ...this.props,
        ...fromPairs((domains || []).map(d => [d, app()[d]])),
      })
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    return setDisplayName(wrapDisplayName(BaseComponent, 'inject'))(
      Inject
    )
  }
  return Inject
}

