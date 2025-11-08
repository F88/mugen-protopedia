import type { Meta, StoryObj } from '@storybook/nextjs';
import { PrototypeMainImage } from './prototype-main-image';

const meta = {
  title: 'Components/Prototype/PrototypeMainImage',
  component: PrototypeMainImage,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof PrototypeMainImage>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock data for different scenarios
const mockPrototypeWithImage = {
  mainUrl: 'https://picsum.photos/600/400?random=1',
  prototypeNm: 'Sample Prototype with Image',
};

const mockPrototypeWithoutImage = {
  mainUrl: '',
  prototypeNm: 'Prototype without Image',
};

const mockPrototypeWithNullImage = {
  mainUrl: '',
  prototypeNm: 'Prototype with Null Image URL',
};

const mockPrototypeWithWhitespaceImage = {
  mainUrl: '   ',
  prototypeNm: 'Prototype with Whitespace Image URL',
};

const mockPrototypeWithoutName = {
  mainUrl: 'https://picsum.photos/600/400?random=2',
  prototypeNm: '',
};

export const WithImage: Story = {
  args: {
    prototype: mockPrototypeWithImage,
  },
};

export const WithoutImage: Story = {
  args: {
    prototype: mockPrototypeWithoutImage,
  },
};

export const WithNullImageUrl: Story = {
  args: {
    prototype: mockPrototypeWithNullImage,
  },
};

export const WithWhitespaceImageUrl: Story = {
  args: {
    prototype: mockPrototypeWithWhitespaceImage,
  },
};

export const WithoutPrototypeName: Story = {
  args: {
    prototype: mockPrototypeWithoutName,
  },
};

export const LongPrototypeName: Story = {
  args: {
    prototype: {
      mainUrl: 'https://picsum.photos/600/400?random=3',
      prototypeNm:
        'This is a very long prototype name that might need to be handled properly in the alt text for accessibility purposes',
    },
  },
};

export const DifferentImageSizes: Story = {
  args: {
    prototype: mockPrototypeWithImage,
  },
  render: () => (
    <div className="space-y-4">
      <div className="w-96">
        <h3 className="mb-2 font-medium">Small Container (384px)</h3>
        <PrototypeMainImage
          prototype={{
            mainUrl: 'https://picsum.photos/800/600?random=4',
            prototypeNm: 'Prototype in Small Container',
          }}
        />
      </div>
      <div className="w-full max-w-2xl">
        <h3 className="mb-2 font-medium">Large Container (672px)</h3>
        <PrototypeMainImage
          prototype={{
            mainUrl: 'https://picsum.photos/1200/800?random=5',
            prototypeNm: 'Prototype in Large Container',
          }}
        />
      </div>
    </div>
  ),
};

export const ErrorState: Story = {
  args: {
    prototype: {
      mainUrl: 'https://invalid-url-that-will-fail.example.com/image.jpg',
      prototypeNm: 'Prototype with Invalid Image URL',
    },
  },
};

export const Image_640x360: Story = {
  args: {
    prototype: {
      mainUrl: '/img/P-640x360.png',
      prototypeNm: 'Prototype with 640x360 Image',
    },
  },
};

export const Image_640x480: Story = {
  args: {
    prototype: {
      mainUrl: '/img/P-640x480.png',
      prototypeNm: 'Prototype with 640x480 Image',
    },
  },
};

export const Image_640x640: Story = {
  args: {
    prototype: {
      mainUrl: '/img/P-640x640.png',
      prototypeNm: 'Prototype with 640x640 Image',
    },
  },
};

export const Fullfilled_Image_1080x2400: Story = {
  args: {
    prototype: {
      mainUrl: '/img/P-1080x2400.png',
      prototypeNm: 'Prototype with 1080x2400 Image',
    },
  },
};
