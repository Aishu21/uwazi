import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Immutable from 'immutable';

import { StackedDualBarChart } from 'app/Charts';
import Loader from 'app/components/Elements/Loader';

import { sortValues } from '../utils/cejilUtils';

export const countriesTemplate = '58b2f3a35d59f31e1345b480';
export const countryKey = 'pa_s';

class CejilChart extends Component {
  componentDidMount() {
    this.props.getData.call(this);
  }

  render() {
    let output = <Loader/>;

    if (this.state && this.state.groupedResults) {
      const { aggregations } = this.state.groupedResults;
      const countriesData = this.props.thesauris.find(thesaury => thesaury.get('_id') === countriesTemplate);

      let data = sortValues(aggregations.all[countryKey].buckets
      .filter(country => country.filtered.doc_count)
      .map((_country) => {
        const country = _country;
        country.label = countriesData.get('values').find(v => v.get('id') === country.key).get('label');
        country.results = country.filtered.doc_count;
        return country;
      }));

      data = this.props.prepareData.call(this, data);

      output = (
        <div className="item item-chart">
          <p>{this.props.label}</p>
          <StackedDualBarChart data={data} chartLabel={this.props.label} />
        </div>
      );
    }

    return (
      <div className="item-group-charts" style={{ paddingTop: '15px', paddingRight: '15px' }}>{output}</div>
    );
  }
}

CejilChart.defaultProps = {
  label: null,
};

CejilChart.propTypes = {
  thesauris: PropTypes.instanceOf(Immutable.List).isRequired,
  label: PropTypes.string,
  getData: PropTypes.func.isRequired,
  prepareData: PropTypes.func.isRequired
};

export default CejilChart;
