const categories = [
    {name: 'Tee', url: 'tee', image: 'https://d1dif2dtw17xb9.cloudfront.net/products/types/13/Tee.png' },
    {name: 'Fleece', url: 'fleece', image: 'https://d1dif2dtw17xb9.cloudfront.net/products/types/14/Fleece.png' },
    {name: 'Mugs', url: 'mugs', image: 'https://d1dif2dtw17xb9.cloudfront.net/products/types/11/Mugs.png' },
    {name: 'Ornament', url: 'ornament', image: 'https://d1dif2dtw17xb9.cloudfront.net/products/types/27/Ornament.png' },
    {name: 'Tumbler', url: 'tumbler', image: 'https://d1dif2dtw17xb9.cloudfront.net/products/types/17/Tumbler.png' },
    {name: 'Shorts', url: 'shorts', image: 'https://d1dif2dtw17xb9.cloudfront.net/products/types/34/Short.png' },
    {name: 'Tote bag', url: 'tote-bag', image: 'https://d1dif2dtw17xb9.cloudfront.net/products/types/22/Tote%20bag.png' },
    {name: 'Poster', url: 'poster', image: 'https://d1dif2dtw17xb9.cloudfront.net/products/types/29/Poster.png' },
    {name: 'Sticker', url: 'sticker', image: 'https://d1dif2dtw17xb9.cloudfront.net/products/types/25/Sticker.png' },
    {name: 'Jacket', url: 'jacket', image: 'https://d1dif2dtw17xb9.cloudfront.net/products/types/30/Jacket.png' },
    {name: 'Tank', url: 'tank', image: 'https://d1dif2dtw17xb9.cloudfront.net/products/types/31/Tanktop.png' },
  ];


const categories_detail = [
  {id: 1, category_url: 'tee', name: 'Shaka Wear Adult Max Heavyweight T-Shirt - SHMHSS', image: 'https://d1dif2dtw17xb9.cloudfront.net/products/237/medias/15320/ygiZAXUnkeKwqnwaY0FVnCEwQNID02n5cdG9qOfY.png', colors: 9, calculateSizeAdjustValues: 8},
  {id: 2, category_url: 'tee', name: 'BELLA + CANVAS - Jersey V-Neck Tee - 3005', image: 'https://d1dif2dtw17xb9.cloudfront.net/products/19/medias/36280/hleDjl1b4rOLFWm7F4qhbpgzqh0ZCFZnSlMf37me.png', colors: 45, sizes: 6},
  {id: 3, category_url: 'tee', name: 'Colortone - Mineral Wash T-Shirt - CD1300', image: 'https://d1dif2dtw17xb9.cloudfront.net/products/235/medias/19987/c7XXymx5emje1KObYoObHYcAXSjrsEVisRREKzBy.png', colors: 4, sizes: 6},
  {id: 4, category_url: 'tee', name: 'Comfort Colors - Garment-Dyed Heavyweight T-Shirt - 1717', image: 'https://d1dif2dtw17xb9.cloudfront.net/products/13/medias/18639/LAjjRJNI1iDNBaLoPrxcx9STWfI34lQDWy7XMS7m.png', colors: 71, sizes: 7},
]

const product = {
    name: 'Shaka Wear Adult Max Heavyweight T-Shirt - SHMHSS',
    description:
      'Introducing the Shaka Wear Adult Max Heavyweight T-Shirt - SHMHSS: Built for durability with shoulder-to-shoulder neck tape and double-needle stitching throughout. Ideal for those seeking rugged, long-lasting quality with a stretch-proof neck collar. Upgrade your wardrobe with this premium essential today.',
    images: [],
    colors: ['#000002', '#a0b5d1', '#bbb9b5', '#6aab71'],
    sizes: [['S', null, null ], ['M', null, null], ['L', 50, 25], , ['XL', null, null], ['2XL', null, null], ['3XL', null, null]],
    features: [
      'Shoulder-to-shoulder neck tape and double-needle stitched neck',
      '1" double-needle stitched sleeve and bottom hems',
      '1" stretch-proof neck collar with satin/woven label',
      'Heavy-duty knitting',
      'Forward-thrusted shoulder seam for comfortable neck fit',
      'Oversized/Relaxed with slight drop shoulder streetwear fit',
      'Quarter-turned to eliminate center crease',
      'Deco Eligible',
    ],
    printing_guide: [
      {
        print_area: 'Front',
        print_file_size: '14x16',
        dpi: '300',
        template: 'View',
      },
      {
        print_area: 'Back',
        print_file_size: '14x16',
        dpi: '300',
        template: 'View',
      },
      {
        print_area: 'Right Sleeve',
        print_file_size: '3.8x3.8',
        dpi: '300',
        template: 'View',
      },
      {
        print_area: 'Left Sleeve',
        print_file_size: '3.8x3.8',
        dpi: '300',
        template: 'View',
      },
    ],
    image_of_color: [
      {
        color_code: '#000002',
        images: [
          'https://www.creativefabrica.com/wp-content/uploads/2023/06/05/Mans-Black-TShirt-Mockup-Hyper-Realistic-71403112-1.png',
          'https://www.creativefabrica.com/wp-content/uploads/2023/06/05/Mans-Black-TShirt-Mockup-Hyper-Realistic-71403112-1.png',
          'https://www.creativefabrica.com/wp-content/uploads/2023/06/05/Mans-Black-TShirt-Mockup-Hyper-Realistic-71403112-1.png',
          'https://www.creativefabrica.com/wp-content/uploads/2023/06/05/Mans-Black-TShirt-Mockup-Hyper-Realistic-71403112-1.png',
        ],
      },
      {
        color_code: '#a0b5d1',
        images: [
          'https://static.vecteezy.com/system/resources/previews/043/592/334/non_2x/blue-t-shirt-on-isolated-transparent-background-png.png',
          'https://static.vecteezy.com/system/resources/previews/043/592/334/non_2x/blue-t-shirt-on-isolated-transparent-background-png.png',
          'https://static.vecteezy.com/system/resources/previews/043/592/334/non_2x/blue-t-shirt-on-isolated-transparent-background-png.png',
          'https://static.vecteezy.com/system/resources/previews/043/592/334/non_2x/blue-t-shirt-on-isolated-transparent-background-png.png',
        ],
      },
      {
        color_code: '#bbb9b5',
        images: [
          'https://img.freepik.com/premium-photo/gray-tshirt-mockup-isolated-white-background-ai-generative_136875-5208.jpg?w=2000',
          'https://img.freepik.com/premium-photo/gray-tshirt-mockup-isolated-white-background-ai-generative_136875-5208.jpg?w=2000',
          'https://img.freepik.com/premium-photo/gray-tshirt-mockup-isolated-white-background-ai-generative_136875-5208.jpg?w=2000',
          'https://img.freepik.com/premium-photo/gray-tshirt-mockup-isolated-white-background-ai-generative_136875-5208.jpg?w=2000',
        ],
      },
      {
        color_code: '#6aab71',
        images: [
          'https://th.bing.com/th/id/OIP.VhW9BIzz90Uia2ZCfkjPGQHaEJ?rs=1&pid=ImgDetMain',
          'https://th.bing.com/th/id/OIP.VhW9BIzz90Uia2ZCfkjPGQHaEJ?rs=1&pid=ImgDetMain',
          'https://th.bing.com/th/id/OIP.VhW9BIzz90Uia2ZCfkjPGQHaEJ?rs=1&pid=ImgDetMain',
          'https://th.bing.com/th/id/OIP.VhW9BIzz90Uia2ZCfkjPGQHaEJ?rs=1&pid=ImgDetMain',
        ],
      },
    ],
  };


  const products = [
    {
      id: 1,
      name: "Basic Crew Neck T-Shirt",
      description: "Comfortable basic t-shirt with a crew neck design.",
      price: 19.99,
      image: "https://www.theuniformedit.com.au/app/uploads/2021/10/5003_TARMAC_V_NECK_TEE_GREY_MARLE.jpg"
    },
    {
      id: 2,
      name: "V-Neck T-Shirt",
      description: "Stylish v-neck t-shirt for a casual look.",
      price: 22.99,
      image: "https://www.theuniformedit.com.au/app/uploads/2021/10/5003_TARMAC_V_NECK_TEE_GREY_MARLE.jpg"
    },
    {
      id: 3,
      name: "Graphic Print T-Shirt",
      description: "T-shirt with a cool graphic print design on the front.",
      price: 29.99,
      image: "https://www.theuniformedit.com.au/app/uploads/2021/10/5003_TARMAC_V_NECK_TEE_GREY_MARLE.jpg"
    },
    {
      id: 4,
      name: "Long Sleeve T-Shirt",
      description: "Casual long sleeve t-shirt perfect for cooler days.",
      price: 24.99,
      image: "https://www.theuniformedit.com.au/app/uploads/2021/10/5003_TARMAC_V_NECK_TEE_GREY_MARLE.jpg"
    },
    {
      id: 5,
      name: "Oversized T-Shirt",
      description: "Trendy oversized t-shirt for a relaxed, comfortable fit.",
      price: 34.99,
      image: "https://www.theuniformedit.com.au/app/uploads/2021/10/5003_TARMAC_V_NECK_TEE_GREY_MARLE.jpg"
    },
    {
      id: 6,
      name: "Ringer T-Shirt",
      description: "Retro-inspired ringer t-shirt with contrast trim on the sleeves.",
      price: 27.99,
      image: "https://www.theuniformedit.com.au/app/uploads/2021/10/5003_TARMAC_V_NECK_TEE_GREY_MARLE.jpg"
    },
    {
      id: 7,
      name: "Pocket T-Shirt",
      description: "Simple t-shirt with a small pocket detail on the chest.",
      price: 19.99,
      image: "https://www.theuniformedit.com.au/app/uploads/2021/10/5003_TARMAC_V_NECK_TEE_GREY_MARLE.jpg"
    },
    {
      id: 8,
      name: "Striped T-Shirt",
      description: "Classic striped t-shirt with a modern fit.",
      price: 26.99,
      image: "https://www.theuniformedit.com.au/app/uploads/2021/10/5003_TARMAC_V_NECK_TEE_GREY_MARLE.jpg"
    }
  ];
  
  


  export {categories, categories_detail, product, products};