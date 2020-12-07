import 'app/Viewer/scss/conversion_base.scss';
import 'app/Viewer/scss/document.scss';

import PropTypes from 'prop-types';
import React, { Component } from 'react';

import Loader from 'app/components/Elements/Loader';
import PDF from 'app/PDF';
import Immutable from 'immutable';
import { highlightSnippet } from 'app/Viewer/actions/uiActions';

import determineDirection from '../utils/determineDirection';

import { APIURL } from '../../config.js';

export class Document extends Component {
  constructor(props) {
    super(props);
    this.pages = { 1: 0 };
    this.previousMostVisible = props.page;
    this.pdfLoaded = this.pdfLoaded.bind(this);
    this.onDocumentReady = this.onDocumentReady.bind(this);
    this.onTextDeselection = this.onTextDeselection.bind(this);
    this.onTextSelected = this.onTextSelected.bind(this);
  }

  componentDidMount() {
    this.props.unsetSelection();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.doc.get('_id') !== nextProps.doc.get('_id')) {
      this.props.unsetSelection();
    }
  }

  componentDidUpdate() {
    highlightSnippet(this.props.selectedSnippet, this.props.searchTerm);
  }

  onTextSelected(textSelection) {
    this.props.setSelection(textSelection, this.props.file._id);
  }

  onTextDeselection() {
    this.props.unsetSelection();
  }

  onDocumentReady() {
    this.props.onDocumentReady(this.props.doc);
  }

  handleClick(e) {
    if (e.target.className && e.target.className.indexOf('reference') !== -1) {
      const references = this.props.references.toJS();
      return this.props.activateReference(
        references.find(r => r._id === e.target.getAttribute('data-id')),
        this.props.file.pdfInfo,
        references
      );
    }
    if (this.props.executeOnClickHandler) {
      this.props.onClick();
    }
  }

  pdfLoaded() {
    if (this.props.doScrollToActive) {
      const references = this.props.references.toJS();
      this.props.scrollToActive(
        references.find(r => r._id === this.props.activeReference),
        this.props.file.pdfInfo,
        references,
        this.props.doScrollToActive
      );
    }

    this.componentDidUpdate();
  }

  handleOver() {}

  renderPDF(file, references) {
    if (!(file._id && file.pdfInfo)) {
      return <Loader />;
    }

    return (
      <PDF
        onPageChange={this.props.onPageChange}
        onPDFReady={this.onDocumentReady}
        pdfInfo={file.pdfInfo}
        onLoad={this.pdfLoaded}
        file={`${APIURL}files/${file.filename}`}
        filename={file.filename}
        onTextSelection={this.onTextSelected}
        onTextDeselection={this.onTextDeselection}
        references={references}
      />
    );
  }

  render() {
    const doc = this.props.doc.toJS();
    const { file, references } = this.props;

    const Header = this.props.header ? this.props.header : () => false;
    return (
      <div>
        <div className={`_${doc._id} document ${this.props.className} ${determineDirection(file)}`}>
          <Header />
          <div
            className="pages"
            ref={ref => (this.pagesContainer = ref)}
            onClick={this.handleClick.bind(this)}
            onMouseOver={this.handleOver.bind(this)}
          >
            {this.renderPDF(file, references)}
          </div>
        </div>
      </div>
    );
  }
}

Document.defaultProps = {
  onDocumentReady: () => {},
  onPageChange: () => {},
  onClick: () => {},
  file: {},
  searchTerm: '',
  page: 1,
  selectedSnippet: Immutable.fromJS({}),
};

Document.propTypes = {
  onPageChange: PropTypes.func,
  onDocumentReady: PropTypes.func,
  doc: PropTypes.object,
  file: PropTypes.object,
  selectedSnippet: PropTypes.instanceOf(Immutable.Map),
  setSelection: PropTypes.func,
  unsetSelection: PropTypes.func,
  header: PropTypes.func,
  searchTerm: PropTypes.string,
  page: PropTypes.number,
  activateReference: PropTypes.func,
  doScrollToActive: PropTypes.bool,
  scrollToActive: PropTypes.func,
  activeReference: PropTypes.string,
  selection: PropTypes.object,
  references: PropTypes.object,
  className: PropTypes.string,
  onClick: PropTypes.func,
  executeOnClickHandler: PropTypes.bool,
  disableTextSelection: PropTypes.bool,
  forceSimulateSelection: PropTypes.bool,
};

export default Document;
