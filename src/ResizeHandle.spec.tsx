import { shallow } from 'enzyme';
import * as React from 'react';

import ResizeHandle from './ResizeHandle';

describe('ResizeHandle', () => {
    it('renders correctly', () => {
        const wrapper = shallow(
            <ResizeHandle
                borderColor="red"
                color="white"
                size={40}
                rotation={30}
            />
        );

        expect(wrapper).toMatchSnapshot();
    });
});
