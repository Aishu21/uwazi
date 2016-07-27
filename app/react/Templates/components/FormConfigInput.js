import React, {Component, PropTypes} from 'react';
import FilterSuggestions from 'app/Templates/components/FilterSuggestions';
import {FormField} from 'app/Forms';
import {connect} from 'react-redux';

export class FormConfigInput extends Component {

  render() {
    const {index, data, formState} = this.props;
    const ptoperty = data.properties[index];
    let labelClass = '';
    let labelKey = `properties.${index}.label`;
    let requiredLabel = formState.errors[labelKey + '.required'];
    let duplicatedLabel = formState.errors[labelKey + '.duplicated'];
    if (requiredLabel || duplicatedLabel) {
      labelClass += ' has-error';
    }

    return (
      <div>
        <div className="row">
          <div className="col-sm-12">
            <div className={labelClass}>
              <span>
                Label
              </span>
              <FormField model={`template.data.properties[${index}].label`}>
                <input className="form-control" />
              </FormField>
            </div>
          </div>
          <div className="col-sm-12">
              <FormField model={`template.data.properties[${index}].required`}>
                <input id={'required' + index} type="checkbox" className="asd"/>
              </FormField>
              <label htmlFor={'required' + index}>Required</label>
          </div>
        </div>
        {(() => {
          if (duplicatedLabel) {
            return <div className="row validation-error">
                    <div className="col-sm-4">
                      <i className="fa fa-exclamation-triangle"></i>
                      &nbsp;
                      Duplicated label
                    </div>
                  </div>;
          }
        })()}
        <div className="well">
          <div className="row">
            <div className="col-sm-4">
              <FormField model={`template.data.properties[${index}].filter`}>
                <input id={'filter' + this.props.index} type="checkbox"/>
              </FormField>
              &nbsp;
              <label htmlFor={'filter' + this.props.index} title="This property will be used for filtering the library results.
              When properties match in equal name and field type with other document types, they will be combined for filtering.">
                Use as filter
                &nbsp;
                <i className="fa fa-question-circle"></i>
              </label>
            </div>
            <div className="col-sm-8">
              <FilterSuggestions {...ptoperty} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

FormConfigInput.propTypes = {
  data: PropTypes.object,
  index: PropTypes.number,
  formState: PropTypes.object,
  formKey: PropTypes.string
};

export function mapStateToProps({template}) {
  return {
    data: template.data,
    formState: template.formState
  };
}

export default connect(mapStateToProps)(FormConfigInput);
