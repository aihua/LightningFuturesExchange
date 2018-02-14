import React from "react";
import ReactDom from "react-dom";
import { HashRouter } from "react-router-dom";

import AxiosinItializer from './js/helpers/axiosinitializer.js'

import $ from "jquery"
import bootstrap from "bootstrap"

import Layout from "./js/components/layout/layout.js"

import axios from 'axios'
import * as ConfigActions from './js/actions/configactions.js'

const app = document.getElementById('app');
ReactDom.render(<HashRouter>
					<Layout />
				</HashRouter>, app);