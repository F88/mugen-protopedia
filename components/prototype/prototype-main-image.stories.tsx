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

// ---------------------------------------------------------------------------
// placehold.co based stories to visualize various intrinsic aspect ratios and
// interaction with the maxHeight prop. These help verify cropping behavior
// (object-cover) and vertical constraints.
// ---------------------------------------------------------------------------

export const Placeholder_600x400_md: Story = {
  args: {
    prototype: {
      mainUrl: 'https://placehold.co/600x400/png?text=600x400',
      prototypeNm: 'Placeholder 600x400',
    },
    maxHeight: 'md',
  },
};

export const PlaceholderWide_800x400_sm: Story = {
  args: {
    prototype: {
      mainUrl: 'https://placehold.co/800x400/png?text=800x400',
      prototypeNm: 'Placeholder 800x400 Wide',
    },
    maxHeight: 'sm',
  },
};

export const PlaceholderTall_600x800_lg: Story = {
  args: {
    prototype: {
      mainUrl: 'https://placehold.co/600x800/png?text=600x800',
      prototypeNm: 'Placeholder 600x800 Tall',
    },
    maxHeight: 'lg',
  },
};

export const PlaceholderSquare_512x512_none: Story = {
  args: {
    prototype: {
      mainUrl: 'https://placehold.co/512x512/png?text=512x512',
      prototypeNm: 'Placeholder 512x512 Square',
    },
    maxHeight: 'none',
  },
};

export const PlaceholderXL_1280x720_xl: Story = {
  args: {
    prototype: {
      mainUrl: 'https://placehold.co/1280x720/png?text=1280x720',
      prototypeNm: 'Placeholder 1280x720 XL',
    },
    maxHeight: 'xl',
  },
};

// Aggregated comparison view for quick visual regression of all maxHeight values.
export const Placeholder_AllHeights: Story = {
  args: {
    // Base args (not actually used in custom render but required for type satisfaction)
    prototype: {
      mainUrl: 'https://placehold.co/600x400/png?text=base',
      prototypeNm: 'Base Placeholder',
    },
    maxHeight: 'md',
  },
  render: () => (
    <div className="space-y-8 w-full max-w-4xl">
      {[
        {
          url: 'https://placehold.co/1200x800/png?text=1200x800',
          label: 'lg',
          height: 'lg',
        },
        {
          url: 'https://placehold.co/800x600/png?text=800x600',
          label: 'md',
          height: 'md',
        },
        {
          url: 'https://placehold.co/600x400/png?text=600x400',
          label: 'sm',
          height: 'sm',
        },
        {
          url: 'https://placehold.co/1280x720/png?text=1280x720',
          label: 'xl',
          height: 'xl',
        },
        {
          url: 'https://placehold.co/512x512/png?text=512x512',
          label: 'none',
          height: 'none',
        },
      ].map((item) => (
        <div key={item.label} className="space-y-2">
          <h3 className="text-sm font-medium">maxHeight = {item.height}</h3>
          <PrototypeMainImage
            prototype={{
              mainUrl: item.url,
              prototypeNm: `Placeholder ${item.label}`,
            }}
            maxHeight={item.height as 'sm' | 'md' | 'lg' | 'xl' | 'none'}
          />
        </div>
      ))}
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Open Graph / Social Preview common aspect ratios
// Reference sizes often used by platforms:
// - 1200x630 (Facebook / general OG)
// - 1200x628 (Twitter/X legacy recommendation)
// - 1200x600 (Slack sometimes auto-scales)
// - 800x418 (fallback smaller OG)
// - 600x315 (minimum acceptable)
// - 1080x1080 (Square share preview)
// ---------------------------------------------------------------------------

export const OGP_1200x630_md: Story = {
  args: {
    prototype: {
      mainUrl: 'https://placehold.co/1200x630/png?text=1200x630+OGP',
      prototypeNm: 'OGP 1200x630',
    },
    maxHeight: 'md',
  },
};

export const OGP_1200x628_md: Story = {
  args: {
    prototype: {
      mainUrl: 'https://placehold.co/1200x628/png?text=1200x628+OGP',
      prototypeNm: 'OGP 1200x628',
    },
    maxHeight: 'md',
  },
};

export const OGP_1200x600_lg: Story = {
  args: {
    prototype: {
      mainUrl: 'https://placehold.co/1200x600/png?text=1200x600+OGP',
      prototypeNm: 'OGP 1200x600',
    },
    maxHeight: 'lg',
  },
};

export const OGP_800x418_sm: Story = {
  args: {
    prototype: {
      mainUrl: 'https://placehold.co/800x418/png?text=800x418+OGP',
      prototypeNm: 'OGP 800x418',
    },
    maxHeight: 'sm',
  },
};

export const OGP_600x315_sm: Story = {
  args: {
    prototype: {
      mainUrl: 'https://placehold.co/600x315/png?text=600x315+OGP',
      prototypeNm: 'OGP 600x315',
    },
    maxHeight: 'sm',
  },
};

export const OGP_1080x1080_none: Story = {
  args: {
    prototype: {
      mainUrl: 'https://placehold.co/1080x1080/png?text=1080x1080+Square',
      prototypeNm: 'OGP 1080x1080 Square',
    },
    maxHeight: 'none',
  },
};

export const OGP_All: Story = {
  args: {
    prototype: {
      mainUrl: 'https://placehold.co/1200x630/png?text=OGP+Overview',
      prototypeNm: 'OGP Overview (Base)',
    },
    maxHeight: 'md',
  },
  render: () => (
    <div className="space-y-8 w-full max-w-5xl">
      {[
        {
          url: 'https://placehold.co/1200x630/png?text=1200x630',
          label: '1200x630',
          h: 'md',
        },
        {
          url: 'https://placehold.co/1200x628/png?text=1200x628',
          label: '1200x628',
          h: 'md',
        },
        {
          url: 'https://placehold.co/1200x600/png?text=1200x600',
          label: '1200x600',
          h: 'lg',
        },
        {
          url: 'https://placehold.co/800x418/png?text=800x418',
          label: '800x418',
          h: 'sm',
        },
        {
          url: 'https://placehold.co/600x315/png?text=600x315',
          label: '600x315',
          h: 'sm',
        },
        {
          url: 'https://placehold.co/1080x1080/png?text=1080x1080',
          label: '1080x1080',
          h: 'none',
        },
      ].map((item) => (
        <div key={item.label} className="space-y-2">
          <h3 className="text-sm font-medium">
            OGP size {item.label} (maxHeight={item.h})
          </h3>
          <PrototypeMainImage
            prototype={{
              mainUrl: item.url,
              prototypeNm: `OGP ${item.label}`,
            }}
            maxHeight={item.h as 'sm' | 'md' | 'lg' | 'xl' | 'none'}
          />
        </div>
      ))}
    </div>
  ),
};

// ---------------------------------------------------------------------------
// High-resolution / widescreen reference sizes
// - 1920x1080 (Full HD)
// - 2560x1440 (QHD / 2K)
// - 3840x2160 (UHD / 4K)
// - 3440x1440 (UltraWide 21:9 common monitor)
// These are not typical OGP sizes but useful for verifying scaling & cropping.
// ---------------------------------------------------------------------------

export const FHD_1920x1080_xl: Story = {
  args: {
    prototype: {
      mainUrl: 'https://placehold.co/1920x1080/png?text=1920x1080+FHD',
      prototypeNm: 'Full HD 1920x1080',
    },
    maxHeight: 'xl',
  },
};

export const QHD_2560x1440_xl: Story = {
  args: {
    prototype: {
      mainUrl: 'https://placehold.co/2560x1440/png?text=2560x1440+QHD',
      prototypeNm: 'QHD 2560x1440',
    },
    maxHeight: 'xl',
  },
};

export const UHD_3840x2160_none: Story = {
  args: {
    prototype: {
      mainUrl: 'https://placehold.co/3840x2160/png?text=3840x2160+4K',
      prototypeNm: 'UHD 4K 3840x2160',
    },
    maxHeight: 'none',
  },
};

export const UltraWide_3440x1440_none: Story = {
  args: {
    prototype: {
      mainUrl: 'https://placehold.co/3440x1440/png?text=3440x1440+UltraWide',
      prototypeNm: 'UltraWide 3440x1440',
    },
    maxHeight: 'none',
  },
};

export const HighRes_All: Story = {
  args: {
    prototype: {
      mainUrl: 'https://placehold.co/1920x1080/png?text=HighRes+Overview',
      prototypeNm: 'HighRes Overview (Base)',
    },
    maxHeight: 'xl',
  },
  render: () => (
    <div className="space-y-8 w-full max-w-5xl">
      {[
        {
          url: 'https://placehold.co/1920x1080/png?text=1920x1080',
          label: '1920x1080 FHD',
          h: 'xl',
        },
        {
          url: 'https://placehold.co/2560x1440/png?text=2560x1440',
          label: '2560x1440 QHD',
          h: 'xl',
        },
        {
          url: 'https://placehold.co/3440x1440/png?text=3440x1440',
          label: '3440x1440 UltraWide',
          h: 'none',
        },
        {
          url: 'https://placehold.co/3840x2160/png?text=3840x2160',
          label: '3840x2160 4K',
          h: 'none',
        },
      ].map((item) => (
        <div key={item.label} className="space-y-2">
          <h3 className="text-sm font-medium">
            HighRes size {item.label} (maxHeight={item.h})
          </h3>
          <PrototypeMainImage
            prototype={{
              mainUrl: item.url,
              prototypeNm: item.label,
            }}
            maxHeight={item.h as 'sm' | 'md' | 'lg' | 'xl' | 'none'}
          />
        </div>
      ))}
    </div>
  ),
};
