import React from "react";
import ReactDom from "react-dom";
import { HashRouter } from "react-router-dom";

import $ from "jquery"
import bootstrap from "bootstrap"

import Layout from "./js/components/layout/layout.js"

const app = document.getElementById('app');
ReactDom.render(<HashRouter>
					<Layout />
				</HashRouter>, app);