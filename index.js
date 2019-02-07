import React, { Component } from 'react';
import { PropTypes } from 'prop-types';

class ScrollPagination extends Component {
  static propTypes = {
    disabled: PropTypes.bool,
    runAtStart: PropTypes.bool,
    containerRefSetter: PropTypes.func,
    onPageChange: PropTypes.func.isRequired,
    triggerOffset: PropTypes.number,
    itemCount: PropTypes.number,
    itemsPerPage: PropTypes.number,
    stopOnOddResultCount: PropTypes.bool
  };

  static defaultProps = {
    triggerOffset: 0,
    itemCount: 0,
    itemsPerPage: 10,
    disabled: false,
    stopOnOddResultCount: true,
    runAtStart: true
  };

  state = {
    containerRef: null
  };

  scrollHandlerQueueId = null;

  pagerElement = null;
  pagerResult = null;

  componentDidMount() {
    this.attachScrollListener(this.getContainerElement());

    if (this.props.containerRefSetter) {
      this.props.containerRefSetter(containerRef => {
        this.setState({ containerRef });
      });
    }
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextState.containerRef !== this.state.containerRef) {
      this.detachScrollListener(this.getContainerElement());
      this.attachScrollListener(nextState.containerRef);
    }

    if (nextProps.itemCount !== this.props.itemCount) {
      this.queueScrollHandler();
    }
  }

  componentWillUnmount() {
    this.detachScrollListener(this.getContainerElement());
  }

  handleScroll = () => {
    const { triggerOffset, disabled, stopOnOddResultCount } = this.props;
    const containerRef = this.getContainerElement();

    if (
      stopOnOddResultCount &&
      this.props.itemCount % this.props.itemsPerPage !== 0
    ) {
      return;
    }

    if (disabled || this.pagerResult !== null) {
      return;
    }

    let containerHeight = this.getElementHeight(containerRef);
    let containerOffsetTop =
      this.getElementOffsetTop(containerRef) +
      this.getElementScrollTop(containerRef);
    let pagerTop = this.getElementOffsetTop(this.pagerElement) + triggerOffset;

    if (
      pagerTop >= containerOffsetTop &&
      pagerTop <= containerOffsetTop + containerHeight
    ) {
      this.pagerResult =
        this.props.onPageChange(this.itemsPerPage, this.itemCount) || null;

      if (this.pagerResult instanceof Promise) {
        this.pagerResult.then(() => {
          this.pagerResult = null;

          this.queueScrollHandler();
        });
      } else {
        this.queueScrollHandler();
      }
    }
  };

  queueScrollHandler = () => {
    clearTimeout(this.scrollHandlerQueueId);
    this.scrollHandlerQueueId = setTimeout(() => this.handleScroll());
  };

  getContainerElement() {
    if (this.state.containerRef === null) {
      return this.pagerElement.parentElement;
    }

    return this.state.containerRef;
  }

  getElementOffsetTop(element) {
    if (element instanceof Window) {
      return element.document.body.offsetTop;
    }

    if (element instanceof Document) {
      return element.body.offsetTop;
    }

    return element.offsetTop;
  }

  getElementHeight(element) {
    if (element instanceof Window) {
      return element.innerHeight;
    }

    if (element instanceof Document) {
      return element.body.clientHeight;
    }

    return element.clientHeight;
  }

  getElementScrollHeight(element) {
    if (element instanceof Window) {
      return element.innerHeight;
    }

    if (element instanceof Document) {
      return element.body.scrollHeight;
    }

    return element.scrollHeight;
  }

  getElementScrollTop(element) {
    if (element instanceof Window) {
      return element.document.body.scrollTop;
    }

    if (element instanceof Document) {
      return element.body.scrollTop;
    }

    return element.scrollTop;
  }

  detachScrollListener(element) {
    if (!element || !(element instanceof EventTarget)) {
      return;
    }

    element.removeEventListener('scroll', this.queueScrollHandler);
  }

  attachScrollListener(element) {
    if (!element || !(element instanceof EventTarget)) {
      return;
    }

    element.addEventListener('scroll', this.queueScrollHandler);

    if (this.props.runAtStart) {
      this.handleScroll();
    }
  }

  render() {
    return (
      <div
        style={{ height: this.props.triggerOffset + 'px' }}
        className="scrollPager"
        ref={ref => (this.pagerElement = ref)}
      />
    );
  }
}

export default ScrollPagination;
