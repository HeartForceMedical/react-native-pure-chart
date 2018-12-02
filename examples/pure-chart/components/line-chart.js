import React from 'react';
import { View, StyleSheet } from 'react-native';

class LineChart extends React.Component {
  constructor (props) {
    super(props)
    this.state = { point: this.props.point };

    // Cache these between runs
    this.lastId = -1;
    this.cachedData = [];
    this.cachedRenderingInfo = {}; // Hashmap
    
    this.height = -1;

    this.min = Number.MAX_VALUE;
    this.max = Number.MIN_VALUE;

    this.drawCoordinates = this.drawCoordinates.bind(this);
    this.drawCoordinate = this.drawCoordinate.bind(this);
    this.setHeight = this.setHeight.bind(this);
  }

  shouldComponentUpdate (nextProps, nextState) {
    return true;
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.point !== this.props.point) {
      this.setState( { point : nextProps.point } );
    }
  }

  // The current chart y values are scaled given the given chart view's height
  scaleByHeight(y) {
    return y * this.height * 0.5;
  }

  computeMinMax (point) {
    if (this.min > point.Y)
    {
      this.min = point.Y;
    }

    if (this.max < point.Y)
    {
      this.max = point.Y;
    }
  }

  scale (points, min, max) {
    let ratio = 0
    let newPoints = []
    let diff = max - min
    if ( diff > 0 ) {
      ratio = 1.0 / diff;
    }

    for (var i = 0; i < points.length; i++) {
      let y = points[i].Y;
      y = (y - min) * ratio;
      newPoints.push({ Id : points[i].Id, Y : y });
    }

    return newPoints;
  }

  getId (start, end) {
    return start.Id.toString() + "," + end.Id.toString()
  }

  drawCoordinates (point) {
    // The render might be called multiple times for the same point
    if (this.lastId != point.Id) {
      this.cachedData.push(point);
      this.lastId = point.Id;
      this.computeMinMax(point);
    }

    // For the first n points, don't render anything.
    let length = this.cachedData.length;
    if (length < 102) {
      return [];
    }

    // At this point, length is 102.
    let scaledData = this.scale(this.cachedData, this.min, this.max);

    let views = [];
    for (var i = 0; i < scaledData.length - 1; i++) {
      result = this.drawCoordinate(
        scaledData[i],
        scaledData[i+1]);
      views.push(result);
    }

    // Shift the chart scaledData for a real-time chart appearance
    let id = this.getId(scaledData[0], scaledData[1]);
    delete this.cachedRenderingInfo[id];
    this.cachedData = this.cachedData.slice(1); // For next run

    return views;
  }

  drawCoordinate (start, end) {
    let dy;
    let size; // width and height of the inner box
    let angle;
    let dx; // width of the outer box
    let height; // height of the outer box
    let top;
    let startY = this.scaleByHeight(start.Y);
    let endY = this.scaleByHeight(end.Y);
    // Don't recompute a line that has already been computed from the last set.
    let idStr = this.getId(start, end);
    let isCached = idStr in this.cachedRenderingInfo;
    let gap = this.props.gap;
    if (isCached) {
      var cachedObj = this.cachedRenderingInfo[idStr];
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
        top = -1 * size;
      }
      else {
        height = 2 * endY;
        top = -1 * (size - Math.abs(dy));
      }
      this.cachedRenderingInfo[idStr] = {
        idStr : idStr,
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
          borderColor: this.props.lineColor,
          borderTopWidth: 1,
          overflow: 'hidden',
          transform: this.getTransform(idStr, isCached),
        }, { borderColor: this.props.lineColor }])} />
      </View>
    )
  }

  // Generate a sine curve between the start and end points
  getTransform (idStr, isCached) {
    let translateX, translateY, angle;
    let cachedObj = this.cachedRenderingInfo[idStr];
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
    if (this.state.point.Id != -1) {
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
        { this.drawCoordinates(this.state.point) }
      </View>
    }
    else {
      return null;
    }
  }
}

LineChart.defaultProps = {
  point: {Id: -1, Y: 0},
  lineColor: '#297AB1',
  gap: 5
}

export default LineChart
