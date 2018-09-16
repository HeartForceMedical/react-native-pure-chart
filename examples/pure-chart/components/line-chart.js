import React from 'react'
import { View, TouchableWithoutFeedback, Text, Animated, Easing, ScrollView, StyleSheet } from 'react-native'
import { Toast } from "@remobile/react-native-toast"
import { ResultsMsg } from '../../../../../out/Messages';

// Input is an array of Y
class LineChart extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      data: this.props.data,
      gap: this.props.gap
    };

    this.drawCoordinates = this.drawCoordinates.bind(this);
    this.drawCoordinate = this.drawCoordinate.bind(this);
  }

  shouldComponentUpdate (nextProps, nextState) {
    return true;
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.data !== this.props.data) {
      this.setState({data : nextProps.data, gap: nextProps.gap});
    }
  }

  getTransform (translateX, translateY, angle) {
    return [ { translateX: translateX }, { translateY: translateY }, { rotate: angle + 'rad' } ]
  }

  drawCoordinate (index, dy, dx, size, height, top, angle, translateX, translateY, 
    backgroundColor, lineStyle, isBlank, lastCoordinate) {
    let key = 'line' + index;
    let topMargin = 20;

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
            borderColor: isBlank ? backgroundColor : this.props.primaryColor,
            borderTopWidth: 1,
            transform: this.getTransform(translateX, translateY, angle)
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
        data[i].DY, 
        this.state.gap,
        data[i].Size, 
        data[i].Height,
        data[i].Top,
        data[i].Angle,
        data[i].TranslateX,
        data[i].TranslateY,
       '#FFFFFF00', {borderColor: this.props.primaryColor}, 
       false, false);
      results.push(result);
    }

    let i = dataLength-1
    result = this.drawCoordinate(
       dataLength, 
       data[i], 
       data[i].DY,
       this.state.gap,
       data[i].Size,
       data[i].Height,
       data[i].Top,
       data[i].Angle,
       data[i].TranslateX,
       data[i].TranslateY, 
       '#FFFFFF', {}, 
       true, true);
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
  primaryColor: '#297AB1',
  selectedColor: '#FF0000',
  height: 100,
  onPointClick: (point) => {
  },
  numberOfYAxisGuideLine: 5
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
