/**
 * @jest-environment jsdom
 */
import React from 'react';

import { shallow } from 'enzyme';
import Immutable from 'immutable';
import { XAxis, YAxis, Cell, BarChart, Tooltip } from 'recharts';

import { mapStateToProps, BarChartComponent } from '../BarChart.js';
import markdownDatasets from '../../markdownDatasets';

describe('BarChart Markdown component', () => {
  const state = {
    thesauris: Immutable.fromJS([
      {
        _id: 'tContext',
        values: [
          { id: 'id1', label: 'label1' },
          { id: 'id2', label: 'label2' },
          { id: 'id3', label: 'label3' },
          { id: 'id4', label: 'label4' },
        ],
      },
    ]),
  };

  const defaultAggregations = [
    { key: 'id1', filtered: { doc_count: 25 } },
    { key: 'id2', filtered: { doc_count: 33 } },
    { key: 'missing', filtered: { doc_count: 45 } },
    { key: 'id3', filtered: { doc_count: 13 } },
    { key: 'id4', filtered: { doc_count: 0 } },
  ];

  const mockGetAggregations = values => {
    spyOn(markdownDatasets, 'getAggregations').and.returnValue(
      Immutable.fromJS(values || defaultAggregations)
    );
  };

  it('should render the data passed by mapStateToProps', () => {
    mockGetAggregations();

    const props = mapStateToProps(state, { prop1: 'propValue' });
    const component = shallow(
      <BarChartComponent {...props} property="prop1" classname="custom-class" context="tContext" />
    );

    expect(markdownDatasets.getAggregations).toHaveBeenCalledWith(state, { prop1: 'propValue' });
    expect(component).toMatchSnapshot();
  });

  describe('when excludeZero', () => {
    it('should render without zero values', () => {
      mockGetAggregations();

      const props = mapStateToProps(state, { prop1: 'propValue' });
      props.excludeZero = 'true';
      const component = shallow(
        <BarChartComponent
          {...props}
          property="prop1"
          classname="custom-class"
          context="tContext"
        />
      );

      expect(markdownDatasets.getAggregations).toHaveBeenCalledWith(state, { prop1: 'propValue' });
      expect(component).toMatchSnapshot();
    });
  });

  describe('when layout is vertical', () => {
    it('should render axis properly', () => {
      mockGetAggregations([{ key: 'id1', filtered: { doc_count: 25 } }]);

      const props = mapStateToProps(state, { prop1: 'propValue' });
      props.layout = 'vertical';
      const component = shallow(
        <BarChartComponent
          {...props}
          property="prop1"
          classname="custom-class"
          context="tContext"
        />
      );

      expect(component.find(YAxis)).toMatchSnapshot();
      expect(component.find(XAxis)).toMatchSnapshot();
    });
  });

  it('should render a placeholder when data is undefined', () => {
    let undefinedValue;
    spyOn(markdownDatasets, 'getAggregations').and.returnValue(undefinedValue);
    const props = mapStateToProps(state, { prop2: 'propValue' });
    const component = shallow(<BarChartComponent {...props} property="prop2" />);

    expect(markdownDatasets.getAggregations).toHaveBeenCalledWith(state, { prop2: 'propValue' });
    expect(component).toMatchSnapshot();
  });

  describe('when passing maxCategories', () => {
    it('should only render the number of categories passed', () => {
      mockGetAggregations([
        { key: 'id1', filtered: { doc_count: 25 } },
        { key: 'id2', filtered: { doc_count: 33 } },
        { key: 'id3', filtered: { doc_count: 13 } },
        { key: 'id4', filtered: { doc_count: 0 } },
      ]);

      const props = mapStateToProps(state, { prop1: 'propValue' });
      props.maxCategories = '2';
      const component = shallow(
        <BarChartComponent
          {...props}
          property="prop1"
          classname="custom-class"
          context="tContext"
        />
      );

      expect(markdownDatasets.getAggregations).toHaveBeenCalledWith(state, { prop1: 'propValue' });
      expect(component).toMatchSnapshot();
    });

    it('should render others when passing aggregateOthers', () => {
      mockGetAggregations([
        { key: 'id6', filtered: { doc_count: 57 } },
        { key: 'id2', filtered: { doc_count: 33 } },
        { key: 'id1', filtered: { doc_count: 25 } },
        { key: 'id3', filtered: { doc_count: 13 } },
        { key: 'id8', filtered: { doc_count: 2 } },
      ]);

      const props = mapStateToProps(state, { prop1: 'propValue' });
      props.maxCategories = '2';
      props.aggregateOthers = 'true';
      const component = shallow(
        <BarChartComponent
          {...props}
          property="prop1"
          classname="custom-class"
          context="tContext"
        />
      );

      expect(markdownDatasets.getAggregations).toHaveBeenCalledWith(state, { prop1: 'propValue' });
      expect(component).toMatchSnapshot();
    });
  });

  describe('when passing a labels map', () => {
    it('should pass the map data to layout formatter and format the tooltip', () => {
      mockGetAggregations();

      const props = mapStateToProps(state, { prop1: 'propValue' });
      const component = shallow(
        <BarChartComponent
          {...props}
          property="prop1"
          context="tContext"
          shortLabels='{"label1": "L1", "label4": "L4"}'
        />
      );
      expect(component.find(BarChart).props().data).toEqual([
        expect.objectContaining({ label: 'label2' }),
        expect.objectContaining({ label: 'L1' }),
        expect.objectContaining({ label: 'label3' }),
        expect.objectContaining({ label: 'L4' }),
      ]);

      const { labelFormatter } = component.find(Tooltip).props();

      expect(labelFormatter('L1')).toBe('label1');
      expect(labelFormatter('non existing label')).toBe('non existing label');
    });
  });

  describe('when passing colors', () => {
    it('should render with a single color', () => {
      spyOn(markdownDatasets, 'getAggregations').and.returnValue(
        Immutable.fromJS([
          { key: 'id1', filtered: { doc_count: 25 } },
          { key: 'id2', filtered: { doc_count: 33 } },
          { key: 'missing', filtered: { doc_count: 45 } },
          { key: 'id3', filtered: { doc_count: 13 } },
          { key: 'id4', filtered: { doc_count: 0 } },
        ])
      );

      const props = mapStateToProps(state, { prop1: 'propValue' });
      props.colors = '#ccc';
      const component = shallow(
        <BarChartComponent
          {...props}
          property="prop1"
          classname="custom-class"
          context="tContext"
        />
      );

      expect(markdownDatasets.getAggregations).toHaveBeenCalledWith(state, { prop1: 'propValue' });
      component.find(Cell).forEach(cell => {
        expect(cell.prop('fill')).toBe('#ccc');
      });
    });

    it('should render with several colors', () => {
      spyOn(markdownDatasets, 'getAggregations').and.returnValue(
        Immutable.fromJS([
          { key: 'id1', filtered: { doc_count: 25 } },
          { key: 'id2', filtered: { doc_count: 33 } },
          { key: 'missing', filtered: { doc_count: 45 } },
          { key: 'id3', filtered: { doc_count: 13 } },
          { key: 'id4', filtered: { doc_count: 0 } },
        ])
      );

      const colors = ['#aaa', '#bbb', '#ccc', '#ddd', '#eee', '#000'];

      const props = mapStateToProps(state, { prop1: 'propValue' });
      props.colors = colors.join(',');

      const component = shallow(
        <BarChartComponent
          {...props}
          property="prop1"
          classname="custom-class"
          context="tContext"
        />
      );

      expect(markdownDatasets.getAggregations).toHaveBeenCalledWith(state, { prop1: 'propValue' });
      component.find(Cell).forEach((cell, index) => {
        expect(cell.prop('fill')).toBe(colors[index]);
      });
    });

    it('should cycle the colors', () => {
      spyOn(markdownDatasets, 'getAggregations').and.returnValue(
        Immutable.fromJS([
          { key: 'id1', filtered: { doc_count: 25 } },
          { key: 'id2', filtered: { doc_count: 33 } },
          { key: 'missing', filtered: { doc_count: 45 } },
          { key: 'id3', filtered: { doc_count: 13 } },
          { key: 'id4', filtered: { doc_count: 0 } },
        ])
      );

      const colors = ['#aaa', '#bbb'];

      const props = mapStateToProps(state, { prop1: 'propValue' });
      props.colors = colors.join(',');

      const component = shallow(
        <BarChartComponent
          {...props}
          property="prop1"
          classname="custom-class"
          context="tContext"
        />
      );

      expect(markdownDatasets.getAggregations).toHaveBeenCalledWith(state, { prop1: 'propValue' });
      component.find(Cell).forEach((cell, index) => {
        expect(cell.prop('fill')).toBe(colors[index % 2]);
      });
    });
  });
});
