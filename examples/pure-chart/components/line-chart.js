import React from 'react';
import { View, StyleSheet } from 'react-native';

// Expects the data in the 0-1 range (scaled by min/max of the data)
class LineChart extends React.Component {
  constructor (props) {
    super(props)
    this.state = { data: this.props.data };

    this.cachedLines = [];
    this.height = -1;

    this.drawCoordinates = this.drawCoordinates.bind(this);
    this.drawCoordinate = this.drawCoordinate.bind(this);
    this.setHeight = this.setHeight.bind(this);
  }

  shouldComponentUpdate (nextProps, nextState) {
    return true;
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.data !== this.props.data) {
      this.setState( { data : nextProps.data } );
    }
  }

  // The current chart y values are scaled given the given chart view's height
  scaleByHeight(y) {
    return y * this.height * 0.5;
  }

  drawCoordinates (data) {
    let results = [];

    // Draw the points
    for (var i = 0; i < data.length - 1; i++) {
      result = this.drawCoordinate(
        data[i],
        data[i+1],
        false);
      results.push(result);
    }

    // Draw the last coordinate
    var i = data.length-1;
    result = this.drawCoordinate(
      data[i],
      data[i],
      true);
    results.push(result);

    // Remove the first points from the last set
    this.cachedLines = this.cachedLines.slice(2);
    return results;
  }

  drawCoordinate (start, end, isLastCoord) {
    let dy;
    let size; // width and height of the inner box
    let angle;
    let dx; // width of the outer box
    let height; // height of the outer box
    let top;
    let startY = this.scaleByHeight(start.Y);
    let endY = this.scaleByHeight(end.Y);
    // Don't recompute a line that has already been computed from the last set.
    let idStr = "line-" + start.Id.toString();
    let isCached = this.cachedLines.hasOwnProperty(idStr);
    let gap = this.props.gap;
    if (isCached) {
      var cachedObj = this.cachedLines[idStr];
      dx = cachedObj.dx;
      dy = cachedObj.dy;
      size = cachedObj.size;
      angle = cachedObj.angle;
      height = cachedObj.height;
      top = cachedObj.top;
    }
    else {
      dx = gap;
      dy = endY - startY;
      size = Math.sqrt(dx * dx + dy * dy);
      angle = -1 * Math.atan2(dy, dx);
      if (startY > endY) {
        height = 2 * startY;
        // For example
        // Let's say dx = 3, dy = 4. size = 5, top = -5 w.r.t box with dimensions 5x5
        top = -1 * size;
      }
      else {
        height = 2 * endY;
        // For example
        // Let's say dx = 3, dy = 4. size = 5, top = -1 w.r.t box with dimensions 5x5
        top = -1 * (size - Math.abs(dy));
      }
      // Cache this key-value pair.
      this.cachedLines[idStr] = {
        dx: dx,
        dy: dy,
        size: size,
        angle: angle,
        height: height,
        top: top };
    }

    return (
      <View key={idStr} style={{
        width: dx,
        height: height,
        overflow: 'hidden'}}>
        <View style={StyleSheet.flatten([{
          top: top,
          width: size,
          height: size,
          borderColor: isLastCoord ? '#FFFFFF' : this.props.lineColor,
          borderTopWidth: 2,
          overflow: 'hidden',
          transform: this.getTransform(idStr, isCached),
        }, isLastCoord ? {} : { borderColor: this.props.lineColor }])} />
      </View>
    )
  }

  // Generate a sine curve between the start and end points
  getTransform (idStr, isCached) {
    let translateX, translateY, angle;
    let cachedObj = this.cachedLines[idStr];
    if (isCached) {
      translateX = cachedObj.translateX;
      translateY = cachedObj.translateY;
      angle = cachedObj.angle;
    }
    else {
      angle = cachedObj.angle;
      let size = cachedObj.size;

      let k = (0 - size / 2);
      let s = size / 2;
      let x = k * (Math.cos(angle) - Math.sin(angle));
      translateX = (-1 * x) - s;
      let y = k * (Math.sin(angle) + Math.cos(angle));
      translateY = (-1 * y) + s;

      cachedObj.translateX = translateX;
      cachedObj.translateY = translateY;
    }

    return [ { translateX: translateX }, { translateY: translateY }, { rotate: angle + 'rad' } ];
  }

  setHeight(layout) {
    this.height = layout.height;
  }

  render () {
    if (this.state.data.length > 0) {
      return <View ref='chartView' 
        onLayout={ (event) => { this.setHeight(event.nativeEvent.layout) } }
        style={{    
        flexDirection: 'row',
        margin: 0,
        paddingRight: 0,
        height: '100%',
        alignItems: 'center',
        justifyContent: 'flex-start',
        overflow: 'hidden',
        backgroundColor: 'transparent'}}>
        { this.drawCoordinates(this.state.data) }
      </View>
    }
    else {
      return null;
    }
  }
}

LineChart.defaultProps = {
  data: [],
  lineColor: '#297AB1',
  gap: 5,
}

// const styles = StyleSheet.create({
// })

export default LineChart
