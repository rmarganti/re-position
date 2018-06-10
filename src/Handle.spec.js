import * as React from 'react';
import { shallow } from 'enzyme';
import ChevronLeft from 'react-icons/lib/md/chevron-left';

import Handle from './Handle';

describe('Handle', () => {
    it('renders correctly', () => {
        const wrapper = shallow(
            <Handle
                Icon={ChevronLeft}
                backgroundColor="red"
                color="white"
                size={40}
                rotate={30}
                styleString="styleString"
            />
        );

        expect(wrapper).toMatchSnapshot();
    });
});
