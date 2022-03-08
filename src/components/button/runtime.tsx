import React from "react";
import { useRecoilState } from "recoil";
import "./index.less";

const Button = function ({ text }: any) {
  const [count, setCount] = useRecoilState<number>(0);
  return <button className="button">11{text}</button>;
};

export default Button;
