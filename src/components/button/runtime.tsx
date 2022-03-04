import React from "react";
import "./index.less";

const Button = function (props) {
  const { text } = props;
  return <button className="button">11{text}</button>;
};

export default Button;
