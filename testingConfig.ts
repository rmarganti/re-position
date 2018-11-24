import { configure as configureEnzyme } from 'enzyme';
import React16Adapter from 'enzyme-adapter-react-16';

configureEnzyme({ adapter: new React16Adapter() });
