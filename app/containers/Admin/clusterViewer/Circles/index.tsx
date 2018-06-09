import React, { Component } from 'react';
import * as d3 from 'd3-hierarchy';
import { keyBy, find } from 'lodash';
import IdeaCircle from './IdeaCircle';
import ClusterCircle from './ClusterCircle';
import GetIdeas, { GetIdeasChildProps } from 'resources/GetIdeas';
import { Node } from '../clusters';

type D3Node = {
  data: Node;
  [key: string]: any;
};

type Props = {
  ideas: GetIdeasChildProps;
  cluster: ParentNode;
  selectedNodes: Node[];
  onClickNode: (Node) => void;
  onShiftClickNode: (Node) => void;
};

type State = {
  nodes: D3Node[];
  hoveredIdea: string | null;
};

class Circles extends Component<Props, State> {

  svgRef: SVGElement | null;

  constructor(props) {
    super(props);
    this.state = {
      nodes: [],
      hoveredIdea: null,
    };
  }

  componentDidMount() {
    const svgRef: any = this.svgRef;
    const ideasById: any = keyBy(this.props.ideas.ideasList, 'id');
    const root = d3.hierarchy(this.props.cluster)
      .sum((d) => ideasById[d.id] ? (ideasById[d.id].attributes.upvotes_count + ideasById[d.id].attributes.downvotes_count) : 1);

    const pack = d3.pack()
      .size([svgRef.width.baseVal.value - 2, svgRef.height.baseVal.value - 2])
      .padding(10);
    pack(root);

    this.setState({
      nodes: root.descendants(),
    });
  }

  setSVGRef = (r) => {
    this.svgRef = r;
  }

  handleOnClickNode = (node) => (event) => {
    if (event.shiftKey) {
      this.props.onShiftClickNode(node.data);
    } else {
      this.props.onClickNode(node.data);
    }
  }

  handleOnMouseEnterIdea = (node) => () => {
    this.setState({ hoveredIdea: node.data.id });
  }

  handleOnMouseLeaveIdea = () => () => {
    this.setState({ hoveredIdea: null });
  }

  isSelected = (node: D3Node) => {
    return !!find(this.props.selectedNodes, { id: node.data.id });
  }

  render() {
    const { nodes } = this.state;
    return (
      <div>
        <svg ref={this.setSVGRef} width={800} height={800}>
          {nodes.map((node, index) => (
            <g
              key={index}
              transform={`translate(${node.x},${node.y})`}
            >
              {node.data.type === 'idea' ?
                <IdeaCircle
                  node={node}
                  ideaId={node.data.id}
                  onClick={this.handleOnClickNode(node)}
                  onMouseEnter={this.handleOnMouseEnterIdea(node)}
                  onMouseLeave={this.handleOnMouseLeaveIdea()}
                  selected={this.isSelected(node)}
                  hovered={node.data.id === this.state.hoveredIdea}
                />
              :
                <ClusterCircle
                  node={node}
                  onClick={this.handleOnClickNode(node)}
                  selected={this.isSelected(node)}
                />
              }
            </g>
          ))}
        </svg>
      </div>
    );
  }
}


export default (inputProps) => (
  <GetIdeas type="load-more" pageSize={250} sort="new">
    {(ideasProps) => ideasProps.ideasList ? <Circles {...inputProps} ideas={ideasProps} /> : null}
  </GetIdeas>
);
