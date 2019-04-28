import React, { Component } from "react";
import { Link } from "react-router-dom";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ToggleButton from "react-bootstrap/ToggleButton";
import ToggleButtonGroup from "react-bootstrap/ToggleButtonGroup";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Button from "react-bootstrap/Button";
import Tooltip from "react-bootstrap/Tooltip";

import TimeAgo from "react-timeago";

import { axiosPOST } from "../utils/axiosClient";
import { getDecodedToken } from "../utils/jwt";
import { labels, fields } from "../assets/labels";

class Review extends Component {
  constructor(props) {
    super(props);
    this.state = {
      review: null,
      vote: null
    };
  }

  componentDidMount() {
    this.setState({ review: this.props.review, vote: this.props.vote });
  }

  render() {
    let isStudent = getDecodedToken().role === "student";
    if (!this.state.review) return <div />;
    let badgeVariant = val => {
      if (!this.state) return;
      switch (val) {
        case 1:
        case 2:
          return "danger";
        case 3:
          return "warning";
        case 4:
        case 5:
          return "success";
        default:
          return "warning";
      }
    };
    const desc = [
      this.state.review.rating.difficulty,
      this.state.review.rating.textbook,
      this.state.review.rating.grading,
      this.state.review.rating.attendance
    ];
    const items1 = [];
    const items2 = [];

    for (const [index, value] of desc.entries()) {
      if (index < 2) {
        items1.push(
          <Col>
            <span>
              <OverlayTrigger
                key={"top"}
                placement={"top"}
                overlay={
                  <Tooltip id={`tooltip-top`}>
                    {labels[index][desc[index] - 1]}
                  </Tooltip>
                }
              >
                <Button variant={badgeVariant(desc[index])} size="sm">
                  {desc[index]}
                </Button>
              </OverlayTrigger>
              &nbsp;{fields[index]}
            </span>
          </Col>
        );
      } else {
        items2.push(
          <Col>
            <span>
              <OverlayTrigger
                key={"top"}
                placement={"top"}
                overlay={
                  <Tooltip id={`tooltip-top`}>
                    {labels[index][desc[index] - 1]}
                  </Tooltip>
                }
              >
                <Button variant={badgeVariant(desc[index])} size="sm">
                  {desc[index]}
                </Button>
              </OverlayTrigger>
              &nbsp;{fields[index]}
            </span>
          </Col>
        );
      }
    }
    return (
      <div>
        {!this.props.hideCourse ? (
          <h5>
            <Link to={`/courses/${this.state.review.course.id}`}>{`${
              this.state.review.course.id
            } - ${this.state.review.course.name}`}</Link>
          </h5>
        ) : (
          ""
        )}
        <Container>
          <Row>
            <Col lg={4} style={{ marginBottom: "auto", marginTop: "auto" }}>
              <Row>
                <Col lg={2}>
                  <h2>
                    <OverlayTrigger
                      key={"top"}
                      placement={"top"}
                      overlay={
                        <Tooltip id={`tooltip-top`}>
                          {labels[4][this.state.review.rating.overall - 1]}
                        </Tooltip>
                      }
                    >
                      <Button
                        variant={badgeVariant(this.state.review.rating.overall)}
                      >
                        {this.state.review.rating.overall}
                      </Button>
                    </OverlayTrigger>
                  </h2>
                </Col>
                <Col>
                  <Row>{items1}</Row>
                  <Row>{items2}</Row>
                </Col>
              </Row>
            </Col>
            <Col lg={8}>
              <Row>
                <Col style={{ wordWrap: "break-word" }}>
                  {this.state.review.content}
                </Col>
              </Row>
              <Row>
                <Col lg={7}>
                  <small className="text-muted">
                    Submitted <TimeAgo date={this.state.review.createdAt} />
                    &nbsp;by&nbsp;
                    {this.state.review.isAnonymous
                      ? "Anonymous"
                      : `${this.state.review.student.name} - ${
                          this.state.review.student.id
                        }`}
                  </small>
                </Col>
                <Col lg={5}>
                  <ToggleButtonGroup
                    type="checkbox"
                    onChange={value => {
                      let action = null,
                        prev = this.state.vote;
                      if (this.state.vote) {
                        if (value.indexOf(this.state.vote) >= 0)
                          action = this.state.vote === "up" ? "down" : "up";
                        else action = this.state.vote;
                      } else {
                        action = value[0];
                      }
                      let vote = action === this.state.vote ? null : action;
                      this.setState({ vote });
                      axiosPOST("/api/votes/" + action, {
                        record: this.state.review._id
                      }).then(res => {
                        let review = { ...this.state.review };
                        switch (res.data.msg) {
                          case "Upvote added": {
                            review.upvotes++;
                            if (prev === "down") review.downvotes--;
                            break;
                          }
                          case "Downvote added": {
                            review.downvotes++;
                            if (prev === "up") review.upvotes--;
                            break;
                          }
                          case "Removed upvote": {
                            review.upvotes--;
                            break;
                          }
                          case "Removed downvote": {
                            review.downvotes--;
                            break;
                          }
                          default:
                            break;
                        }
                        this.setState({ review });
                      });
                    }}
                    value={
                      isStudent && this.state.vote ? [this.state.vote] : []
                    }
                  >
                    <ToggleButton
                      disabled={!isStudent}
                      value="up"
                      variant="outline-success"
                      size="sm"
                    >
                      Helpful ({this.state.review.upvotes})
                    </ToggleButton>
                    <ToggleButton
                      disabled={!isStudent}
                      value="down"
                      variant="outline-danger"
                      size="sm"
                    >
                      Not Helpful ({this.state.review.downvotes})
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
        <hr />
      </div>
    );
  }
}

export default Review;
