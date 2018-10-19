import React from 'react'
import PropTypes from 'prop-types'
import  {View } from 'react-native'

import LineChart from './components/line-chart'

export default class PureChart extends React.Component {
  constructor (props) {
    super(props)
    this.renderChart = this.renderChart.bind(this)
  }
  renderChart () {
    return <LineChart {...this.props} />
  }

  render () {
    return (
      <View>
        { this.renderChart() }
      </View>
    )
  }
}

PureChart.propTypes = {
  data: PropTypes.array.isRequired
}

PureChart.defaultProps = {
}
