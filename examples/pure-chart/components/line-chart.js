import React from 'react'
import { View, TouchableWithoutFeedback, Text, Animated, Easing, ScrollView, StyleSheet } from 'react-native'
import { Toast } from "@remobile/react-native-toast"

class LineChart extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      data: this.props.data
    };

    this.drawCoordinates = this.drawCoordinates.bind(this);
    this.drawCoordinate = this.drawCoordinate.bind(this);
  }

  shouldComponentUpdate (nextProps, nextState) {
    return true;
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.data !== this.props.data) {
      this.setState({data : nextProps.data});
    }
  }

  getTransform (angle, width) {
    let x = (0 - width / 2) * Math.cos(angle) - (0 - width / 2) * Math.sin(angle);
    let y = (0 - width / 2) * Math.sin(angle) + (0 - width / 2) * Math.cos(angle);

    return [ {translateX: (-1 * x) - width / 2}, {translateY: (-1 * y) + width / 2}, { rotate: angle + 'rad' } ];
  }

  drawCoordinate (index, start, end, gap, backgroundColor, lineStyle, lastCoordinate) {
    let key = 'line' + index;
    let dx = gap;
    let dy = end.Y - start.Y;
    let size = Math.sqrt(dx * dx + dy * dy);
    let angleRad = -1 * Math.atan2(dy, dx);
    let height;
    let top;
    let topMargin = 20;

    if (start.Y > end.Y) {
      height = start.Y;
      top = -1 * size;
    } else {
      height = end.Y;
      top = -1 * (size - Math.abs(dy));
    }

    return (
      <View key={key} style={{
        height: this.props.height + topMargin,
        justifyContent: 'flex-end'
      }}>
        <View style={StyleSheet.flatten([{
          width: dx,
          height: height,
          marginTop: topMargin
        }, styles.coordinateWrapper])}>
          <View style={StyleSheet.flatten([{
            top: top,
            width: size,
            height: size,
            borderColor: lastCoordinate ? backgroundColor : this.props.primaryColor,
            borderTopWidth: 1,
            transform: this.getTransform(angleRad, size)
          }, styles.lineBox, lineStyle])} />
          <View style={StyleSheet.flatten([styles.absolute, {
            height: height - Math.abs(dy) - 2,
            backgroundColor: lastCoordinate ? '#FFFFFF00' : backgroundColor,
            marginTop: Math.abs(dy) + 2
          }])} />
        </View>
        {!lastCoordinate ? (
          <View style={StyleSheet.flatten([styles.guideLine, {
            width: dx,
            borderRightColor: this.props.xAxisGridLineColor
          }])} />
        ) : null}
      </View>
    )
  }

  drawCoordinates (data) {
    let results = []
    let dataLength = data.length
    for (let i = 0; i < dataLength - 1; i++) {
      let result = this.drawCoordinate(
        i, 
        data[i],
        data[i+1],
        this.props.gap,
       '#FFFFFF00', 
       {borderColor: this.props.primaryColor}, 
       false);
      results.push(result);
    }

    let i = dataLength-1;
    result = this.drawCoordinate(
       i, 
       data[i], 
       data[i],
       this.props.gap,
       '#FFFFFF', 
       {}, 
       true);
    results.push(result);
    
    return results;
  }

  render () {
    return (
      this.state.data.length > 0 ? (
        <View style={StyleSheet.flatten([styles.wrapper, {
          backgroundColor: this.props.backgroundColor
        }])}>
          <View ref='chartView' style={styles.chartViewWrapper}>
            <View key={'animated_'} style={{
              flexDirection: 'row',
              alignItems: 'flex-end',
              height: '100%',
              position: 'relative',
              minWidth: 200}}>
              {this.drawCoordinates(this.state.data)}
            </View>
          </View>
        </View>
      ) : null
    )
  }
}

LineChart.defaultProps = {
  data: [],
  gap: 5,
  height: 100,
  primaryColor: '#297AB1'
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    overflow: 'hidden'
  },
  yAxisLabelsWrapper: {
    paddingRight: 5
  },
  chartViewWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    margin: 0,
    paddingRight: 0,
    overflow: 'hidden'
  },
  coordinateWrapper: {
    overflow: 'hidden',
    justifyContent: 'flex-start',
    alignContent: 'flex-start'
  },
  lineBox: {
    overflow: 'hidden',
    justifyContent: 'flex-start'
  },
  guideLine: {
    position: 'absolute',
    height: '100%',
    borderRightColor: '#e0e0e050',
    borderRightWidth: 1
  },
  absolute: {
    position: 'absolute',
    width: '100%'
  },
  pointWrapper: {
    position: 'absolute',
    borderRadius: 10,
    borderWidth: 1
  },
  selectedWrapper: {
    position: 'absolute',
    height: '100%',
    alignItems: 'flex-start'
  },
  selectedLine: {
    position: 'absolute',
    width: 1,
    height: '100%'
  },
  selectedBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    opacity: 0.8,
    borderColor: '#AAAAAA',
    borderWidth: 1,
    position: 'absolute',
    padding: 3,
    marginLeft: 5,
    justifyContent: 'center'
  },
  tooltipTitle: {fontSize: 10},
  tooltipValue: {fontWeight: 'bold', fontSize: 15}
})

export default LineChart
