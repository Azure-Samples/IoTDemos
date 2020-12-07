import React from "react";
import { Route } from "react-router-dom";

export const RouteWithLayout = ({
  component: Component,
  layout: Layout,
  layoutProps,
  componentProps,
  ...rest
}) => (
  <Route
    {...rest}
    render={props => (
      <Layout {...layoutProps}>
        <Component {...props} {...componentProps} />
      </Layout>
    )}
  />
);
