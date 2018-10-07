import React from 'react';
import { View, TouchableWithoutFeedback, Text, Animated, Easing, ScrollView, StyleSheet } from 'react-native';
import { Toast } from "@remobile/react-native-toast";

class LineChart extends React.Component {
  constructor (props) {
    super(props)
    this.state = { data: this.props.data };

    this.cachedObjs = [];

    this.drawCoordinates = this.drawCoordinates.bind(this);
    this.drawCoordinate = this.drawCoordinate.bind(this);
  }

  shouldComponentUpdate (nextProps, nextState) {
    return true;
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.data !== this.props.data) {
      this.setState( { data : nextProps.data } );
    }
  }

  drawCoordinates (data) {
    let results = [];

    // Draw the points
    for (var i = 0; i < data.length - 1; i++) {
      result = this.drawCoordinate(
        data[i],
        data[i+1],
        this.props.gap,
        '#FFFFFF00',
        {borderColor: this.props.primaryColor},
        false);
      results.push(result);
    }

    // Draw the last coordinate
    var i = data.length-1;
    result = this.drawCoordinate(
      data[i],
      data[i],
      this.props.gap,
      '#FFFFFF',
      {},
      true);
    results.push(result);

    // Remove the first point from the last set
    this.cachedObjs = this.cachedObjs.slice(2);
    return results;
  }

  drawCoordinate (start, end, gap, backgroundColor, lineStyle, isLastCoord) {
    let dx, dy, size, angle, height, top;
    // Don't recompute a line that has already been computed from the last set.
    let idStr = "line-" + start.Id.toString();
    let isCached = this.cachedObjs.hasOwnProperty(idStr);
    if (!isCached) {
      dx = gap;
      dy = end.Y - start.Y;
      size = Math.sqrt(dx * dx + dy * dy);
      angle = -1 * Math.atan2(dy, dx);
      if (start.Y > end.Y) {
        height = start.Y;
        top = -1 * size;
      }
      else {
        height = end.Y;
        top = -1 * (size - Math.abs(dy));
      }
      // Cache this key-value pair.
      this.cachedObjs[idStr] = { dx: dx, dy: dy, size: size, angle: angle, height: height, top: top };
    }
    else {
      var cachedObj = this.cachedObjs[idStr];
      dx = cachedObj.dx;
      dy = cachedObj.dy;
      size = cachedObj.size;
      angle = cachedObj.angle;
      height = cachedObj.height;
      top = cachedObj.top;
    }

    let topMargin = 20;

    return (
      <View key={idStr} style={{
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
            borderColor: isLastCoord ? backgroundColor : this.props.primaryColor,
            borderTopWidth: 1,
            transform: this.getTransform(idStr, isCached)
          }, styles.lineBox, lineStyle])} 
          />
          <View style={StyleSheet.flatten([styles.absolute, {
            height: height - Math.abs(dy) - 2,
            backgroundColor: isLastCoord ? '#FFFFFF00' : backgroundColor,
            marginTop: Math.abs(dy) + 2
          }])} />
        </View>
        {!isLastCoord ? (
          <View style={StyleSheet.flatten([styles.guideLine, {
            width: dx,
            borderRightColor: this.props.xAxisGridLineColor
          }])} />
        ) : null}
      </View>
    )
  }

  getTransform (idStr, isCached) {
    let translateX, translateY, angle;
    let cachedObj = this.cachedObjs[idStr];
    if (!isCached) {
      angle = cachedObj.angle;
      let size = cachedObj.size;
      let x = (0 - size / 2) * Math.cos(angle) - (0 - size / 2) * Math.sin(angle);
      let y = (0 - size / 2) * Math.sin(angle) + (0 - size / 2) * Math.cos(angle);

      translateX = (-1 * x) - size / 2;
      cachedObj.translateX = translateX;
      translateY = (-1 * y) + size / 2;
      cachedObj.translateY = translateY;
    }
    else {
      translateX = cachedObj.translateX;
      translateY = cachedObj.translateY;
      angle = cachedObj.angle;
    }

    return [ { translateX: translateX }, { translateY: translateY }, { rotate: angle + 'rad' } ];
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
              { this.drawCoordinates(this.state.data) }
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
