import { configure as configureEnzyme } from 'enzyme';
import * as React16Adapter from 'enzyme-adapter-react-16';

configureEnzyme({ adapter: new React16Adapter() });
