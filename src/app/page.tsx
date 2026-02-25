"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const defaultHeroImages = ["/hero1.jpg", "/hero2.jpg", "/hero3.jpg", "/hero4.jpg", "/hero5.jpg"];

const categories = [
  {
    name: "Heritage Meats",
    count: "12 Selections",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAXjbKVPH5yGG2zJZ8LA6Z9L3QRCa6PNgVEDCd74A28YyOsxr4Fu87qjDMEgVBPx-aCjy4Qwn3scZ_xQ_ZEokKg1J5CB8Hxh8ADjgtq5lBvZ63VwhlsIWsLvnI34ClSVmHvCsVp99Ftzevd7LErbOlUNoEcckOFJsOkbIIuA0OYIun-KeRRZPNUMxiNy1DLLK6BMvyFccm08GAy0_PISUoedTOrHC2yktojOdFc2gtBrFyqHkByocqgUNHd4gY0ciVS5KTEEzBiuMvp",
  },
  {
    name: "Farm Vegetables",
    count: "45 Selections",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDC7hjJ81FJnujXzosLBwnZL4nAxoY0lc-NmPKY_DafjyUWuoPRQFc4YFwx--1-uo-irrvvjeCZZk7-GSZ9TTakl9Qi_4Zzg2G7i56o0b41-JUx_MmUuT7uPV4JAiHlOL6rWoUtLJv1f0sOBcLiDCy5AZL01z9wO0cLM0-MEkB9a1w23jF-JHX6mhEqDuI_u8agAm25ESXq5WZDW_mZT9F9vi-QIjNg9Kg2THCri90nWgEMv6maKsqGAHSPOvtCJQSh6SfPoNj-ICvw",
  },
  {
    name: "Orchard Fruits",
    count: "32 Selections",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAIeh_lUqhtQnlLaebqvj51AihYIAJJVvU7uGGh1siaZK4QXxj4lR2nI420SKjusVo41ADhNqyjBXj2khQ2o2pFXuc5FpeE3Gdt6-GKtMEzJGYW18HB5ZYjce3H8umDJ59eoellFaOvFY_Y8X0EJxHud-WHM33vzSpxpF0tMe7ldWQgkqBXnIvvlctmAA1oaBVrhtSX0laW8GxIxWpyKSXfYpFNvmGcYqxbjAWAAn3ZJDR2KYMFZ9AHyPZpI9WMnyNnfSk-sL6HEEzA",
  },
  {
    name: "Artisan Snacks",
    count: "28 Selections",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAhTJn7AfEegilBlkY5r4aDrUXBrumZ23Sod2_g6U8RK2GYcPMQmaucFeNBf5rbUTI05q-Y89nepWPFoUmig0_ni9-K6LYVHdJXOzTWB08ZNG_iQUQGkFYVNRts3MUigNSF2DMC4-2jwJ6xmOMtAAU7REJ2T283DIYK7j5EfloEo5mF0ngHrWrY-5SRFr5slD0jlA8kDAGe6HMywKCKP7SieztyPlViJuGkd3bg1BwlgCrFZf5nCTqc_8UQVbW0fhXmlicJzE2Xw_c1",
  },
  {
    name: "Morning Bakery",
    count: "18 Selections",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCTQd32-LWO00bS_Bi1kGrjbBuWqRTB4AG-7L6SPriHRueh8k_VFzlTYKX535jqJpezqJnvIbqn-UfrC5XapF7VGgkhweaxGxNXZZGMosAXciZiVtkserrsWmVF80UgjO-vg3s9igISDWDUfoi8nm2YSfFX94Io4GzfU5ctOEZ6Pcr7Vuvvo1VZTJvFy8-fhe3jz59LAD1Pu89kFT0kh5WarsNflYbbmglMuDY89P20-_cyk4EZzaKTeYzpvzBGZM8ttf_9TJDwIqft",
  },
  {
    name: "Cold Pressed",
    count: "10 Selections",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA-NiH9eoD9U2ceeH8JBJ9A7ctoVmJFQ2LJAmgN7Ek-KG_4wz3PsCmYdMT16PwjNclSl-ywQoC8D4abQDDkoP0Bdwnd7-SXOiOe-Uw1OoTn8kSVl_rb-1QhFPJsFO_nRHvMBI7ExWyXIVOHYfHzUyhj1IPAYWHq5QWyu8rsGu9rOTD3PvuhW87G-UqxzvkM_jxx1kdgB4LOh0PDceKQ2hGNUEWphTLVTga2AX3AzLwP_tXo_8od4svFIlJSza31qNh9cJ75Zmh-5OWC",
  },
  {
    name: "Fine Desserts",
    count: "15 Selections",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDkV_G8cw8qkKSPq6KkZZUFtQAzzUynD3u--71pCmj0CNSKq8jMxUq_8TstQ6JP0soH5xZuI59lfdRlGVIQnCCVhQdcnJaAm2lVA_dCehtyr-c8KR3-PQT97LxxIJbInAjycN8Y5-ikC00G-NQuXhUCMSdh4lX9WJnb1bmCt8ra9NwBMzq0Bp3uNMPnh6zfVs-l7p7pjoRXbbRL2sfRZ55Yey1-_ytO-5C2XzwcdAhHjvUUoFPOfTg2A2Vv-sn-iMmLj7opWjYhOWic",
  },
];

const flashProducts = [
  {
    name: "Natural Pure Strawberries",
    category: "Wild Harvest",
    price: "$12.00",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAKNxy76PvIyTle7fLonNVjPDd53YiJdRLADq_ClTeie4QvyyZDqAbjz78GQ7jaW0FZxg-z1E71a4ChI6Ur09EgWB2vpfEcvoSUl4iFpgKjCn5yLiLTRe09vSojiHDHJBe4N3bjMrMJUcFFwhoJQdR1L7vIYu3hNlAJ0Gd5inhI6MwJ-G-xPykxFgjApfjF1BuNrd7HnZm2N1TJvBgZ5OEGtAudN21FZQov45mhch2VYvIpVtvHcNm53fJHWysVuQOUGMpqG-AyhoBs",
  },
  {
    name: "Organic Red Pomegranate",
    category: "Heritage Orchards",
    price: "$18.00",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBBGKR0av6qIn270MehYbW6z5tcbswwCBefYuj8LoUzvpNmPaxrGx7As-inI-MsTyEvl8j-3OoAqDMNHBbtsJog5DIjLPN9EjFfUMmFTUGc3fGJmXD12D9hAyi7XK2h_jNDRitWmC4gXDxadlw4eDc-LPYgqNkYeDiezZa2aEvdyD6o1QyCGTEJLZU9oISh-Ohm2lZJ9ztS0CN6-VNEebAONp6qmghGhXd3PrBlZ_gtfNussSN2ijVrawhcCq1E5JScE4JUcQ3_1ARa",
  },
  {
    name: "Natural Vine Tomato",
    category: "Farm Fresh",
    price: "$8.00",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBd2jvcKDP11VunjnsPGw7DEQBG3H5D7Xd95JBfnHX-ofXxNpZbynfHF5kGKGT684H5P_tiQ50j1NxoEfX-ysif-3GVv25YW4RXPFfM82bc2ku6L5dh08lxVa9H7b6Klk_tO3Sgav6DwdWmjj9QQ7h062BFx-ICv26T6NzdLwI_9QYxiNm6lU3g5Aycm-97AMqobIxjShSPl25Yx99xhema89ZnwB_K0F7gIk86MMH1xU9-5a44-FTZ1TTv_qD533w-xg6lOcFVQhfR",
  },
  {
    name: "Gold Pineapple",
    category: "Tropical Gold",
    price: "$25.00",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCY3gborX3HE8BLGCw2taozjq6ov5XRecM0s3rRB8BvReb235mN__IrdwoOhpOILd4tKBbO-auI1czJu7kBE94j_YSP32R1d4Tk6il0G_RQFaMZFsj2K8ddDx1lEXGZ1dMkgrJUfjyNZDl9db2LFmuJMgCB3uyzwZ0OdCci8El---wkeoNrSuHcCVBUdnvE6y49UeT2BWEXhzwvGRDpUypRnCPXjAD890O4HDWWbTG7mknaKtNSngGSmpm3ytoYljzqyVB147XdhCX9",
  },
];

const featuredProducts = [
  {
    name: "Organic Red Sweet Pepper",
    category: "Organic Estate",
    weight: "1000gm",
    price: "$24.00",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDC7hjJ81FJnujXzosLBwnZL4nAxoY0lc-NmPKY_DafjyUWuoPRQFc4YFwx--1-uo-irrvvjeCZZk7-GSZ9TTakl9Qi_4Zzg2G7i56o0b41-JUx_MmUuT7uPV4JAiHlOL6rWoUtLJv1f0sOBcLiDCy5AZL01z9wO0cLM0-MEkB9a1w23jF-JHX6mhEqDuI_u8agAm25ESXq5WZDW_mZT9F9vi-QIjNg9Kg2THCri90nWgEMv6maKsqGAHSPOvtCJQSh6SfPoNj-ICvw",
  },
  {
    name: "Premium Lemon Green Tea",
    category: "Artisan Tea",
    weight: "1000gm",
    price: "$24.00",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA-NiH9eoD9U2ceeH8JBJ9A7ctoVmJFQ2LJAmgN7Ek-KG_4wz3PsCmYdMT16PwjNclSl-ywQoC8D4abQDDkoP0Bdwnd7-SXOiOe-Uw1OoTn8kSVl_rb-1QhFPJsFO_nRHvMBI7ExWyXIVOHYfHzUyhj1IPAYWHq5QWyu8rsGu9rOTD3PvuhW87G-UqxzvkM_jxx1kdgB4LOh0PDceKQ2hGNUEWphTLVTga2AX3AzLwP_tXo_8od4svFIlJSza31qNh9cJ75Zmh-5OWC",
  },
  {
    name: "Imported South Africa Lemons",
    category: "Heritage Groves",
    weight: "1000gm",
    price: "$24.00",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAIeh_lUqhtQnlLaebqvj51AihYIAJJVvU7uGGh1siaZK4QXxj4lR2nI420SKjusVo41ADhNqyjBXj2khQ2o2pFXuc5FpeE3Gdt6-GKtMEzJGYW18HB5ZYjce3H8umDJ59eoellFaOvFY_Y8X0EJxHud-WHM33vzSpxpF0tMe7ldWQgkqBXnIvvlctmAA1oaBVrhtSX0laW8GxIxWpyKSXfYpFNvmGcYqxbjAWAAn3ZJDR2KYMFZ9AHyPZpI9WMnyNnfSk-sL6HEEzA",
  },
  {
    name: "Organic Hass Avocado",
    category: "Italian Harvest",
    weight: "1000gm",
    price: "$24.00",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCkamhTltGTMMFHxDY9mW6nAKiYE0AXzvNhmSmepISnQ_e87rtr8YgHTmejzxjSCvbsWuRtnpk2yaNWr0BIH2mAuecMBMu5JKVqEIEubgy61iojBkMqRs-Rq_q5oZkTvjBH6UvjZaimj2pBj983iQt7XhFNbFvwx1Q1o5Zjvby6mzlVp56LhuRd69qEgWgOwJZIVIvtLgVNezAAkDotwmS17PEeu9n80RiDmMeqbNCFCYZlzqkcoJxETlH282jLr0a0BQubA2jsK6Ss",
  },
];

const weeklyProducts = [
  { name: "Organic Grapes", price: "$30.00", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDWcP0w7qt1gICLs1qPeeqkJP6p8b0qzlIsJbdPeSJ3VWB5siw2zMdYPgOWGVkjVzL0zvclYoeyk30pcxlU26vBYLTYWw9lnqBSXNwMftt6eNUlohl6y7SdRuDdk_w3G5zgDlejmNtCTV8XFRCUWjfCRMl_b6Qyq-ZHReWX8hX3fJ9nOYICaBLC4vked8lC3nY0l4lYbi-QV_kAuQcuu0HvARwNhup_QyP4K-9Byt_hP0cKJ6GjQ5WVW0N1qujPAySWBPgNAneVrFX9" },
  { name: "Organic Banana", price: "$22.00", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDVQ463cRlsFnQF84Vid8KafP6nUm5zUOmhknQlut8b_6giNB0SUr8XQ8yOa94Cx57W9boYwgLhEHUnKN0CiNQtk6m9gqxJy3di_5jIGtFtPzRzvEPic9xNso4tKkngrC0n6G_8LvknoiBoVfsS-LcylvM1xktx-JptFnTmmrjjEHdPc8eRdzmOM0T-NMoJIU11yOf3FdXXCDEeOoexY4ZMH-TzOjVhtl98R4qbGyjVs9c21oVdsk8GiR9Mw5-97TAC7DuIA6GeNZgd" },
  { name: "Organic Broccoli", price: "$22.00", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAE3rpi3g2G1uHA4-rP_ptkD0M1oyEcOgAI7KfWL14U_xwnSBC6uxWYNrdxlN5hR0Ef7By1MJhk5OyeBfJQdYIVNFMeWByBL_enkrsRw1LTTjEWpIQYNdcxxfr2RulCRV18k0CxoaM_pLCwZW-f7M3v7_33mff7Y99Ac6Y9yL6KhU1oC4CCK_SGMFjkZapLIrubOOi1F3W1f4wb7kxEn20HB76BCFJZ1RewYKypsb6AYf00J6OXQMzfI1LGHpJvarVqN8nQ9zR9SxVP" },
  { name: "Organic Lettuce", price: "$20.00", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA5dettObX418i4DOPQu3bhDfsEDkl287y62AEQ-VvV-Cuh7OYsyA0wQhoNbTUHDtpr7Cc62O-19ZO95omiR15yjImPAMxBt9VBElZLZtBRGXEH1cLG8TVmo_eEp3v_E5mnNiLfSWePvzcY8MAmMB-VfzLI9QO337SYYvRbgf9oR-xi8kG1qKL5aktgXM4icu0dvMgPXuP4DQI0FFrvV8S0DyHXZyrdGYiqpofAb25oqZHSqfgvsKdcUlTSvQeGmVpG5x392vT-YpPE" },
  { name: "Organic Corn", price: "$15.00", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDVinRTWkjCjXeSpGNBEkMNWc0kMgKAoenQJnCjefUwhyRV_4VJ8NRPKJbMSAxvKPlToecrMyAOj6SGgWVU8nual6VQCtrx3xIRUgeQgx_3c13Xpdbt2CjmcuQJuVZsZspeYY0ki9UAZaPmITmGtfD8445Fitwx4ETTqCWdPsxpEObZnsDSWAfvaiJTglJsLOQ0zsUE6ZsA1dQLAhojwoZteOQdbnGlHS4so_SN3ikCOMn8CncU0KTxO3Wi8JNyBUfxEnlIjZNOyB46" },
];

const collections = [
  {
    title: "Artisanal Sauces",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA-NiH9eoD9U2ceeH8JBJ9A7ctoVmJFQ2LJAmgN7Ek-KG_4wz3PsCmYdMT16PwjNclSl-ywQoC8D4abQDDkoP0Bdwnd7-SXOiOe-Uw1OoTn8kSVl_rb-1QhFPJsFO_nRHvMBI7ExWyXIVOHYfHzUyhj1IPAYWHq5QWyu8rsGu9rOTD3PvuhW87G-UqxzvkM_jxx1kdgB4LOh0PDceKQ2hGNUEWphTLVTga2AX3AzLwP_tXo_8od4svFIlJSza31qNh9cJ75Zmh-5OWC",
  },
  {
    title: "The Freshness",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCkamhTltGTMMFHxDY9mW6nAKiYE0AXzvNhmSmepISnQ_e87rtr8YgHTmejzxjSCvbsWuRtnpk2yaNWr0BIH2mAuecMBMu5JKVqEIEubgy61iojBkMqRs-Rq_q5oZkTvjBH6UvjZaimj2pBj983iQt7XhFNbFvwx1Q1o5Zjvby6mzlVp56LhuRd69qEgWgOwJZIVIvtLgVNezAAkDotwmS17PEeu9n80RiDmMeqbNCFCYZlzqkcoJxETlH282jLr0a0BQubA2jsK6Ss",
  },
  {
    title: "Home Bake",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCTQd32-LWO00bS_Bi1kGrjbBuWqRTB4AG-7L6SPriHRueh8k_VFzlTYKX535jqJpezqJnvIbqn-UfrC5XapF7VGgkhweaxGxNXZZGMosAXciZiVtkserrsWmVF80UgjO-vg3s9igISDWDUfoi8nm2YSfFX94Io4GzfU5ctOEZ6Pcr7Vuvvo1VZTJvFy8-fhe3jz59LAD1Pu89kFT0kh5WarsNflYbbmglMuDY89P20-_cyk4EZzaKTeYzpvzBGZM8ttf_9TJDwIqft",
  },
  {
    title: "Marvel Baby",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBPLZbCgEyf_wK7rdYgoFFTaet0XZXwmwJoAGs_sUiwhtRls4_5ym4sfb2-9vj8hH6Ab7Phjf73tcXwOPR5K3gZSSwOpRxYyiUKyrpRzMxJYrATKanuKO4SH-QGblo7EqLrgG7OOdE3v-sCgC_QLuc8DwpQ8BnHOI4dnETUvmwzJkv_97szSupuom19Kwb5bw1Jn7Qtv9QBQhh5NFuOM1a9C-Z9vpFUI794k8e38QM3MFFyztLAw62DDF7ZQGbwuGw1jVfRfcFRB-_l",
  },
];

const partners = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuA-NiH9eoD9U2ceeH8JBJ9A7ctoVmJFQ2LJAmgN7Ek-KG_4wz3PsCmYdMT16PwjNclSl-ywQoC8D4abQDDkoP0Bdwnd7-SXOiOe-Uw1OoTn8kSVl_rb-1QhFPJsFO_nRHvMBI7ExWyXIVOHYfHzUyhj1IPAYWHq5QWyu8rsGu9rOTD3PvuhW87G-UqxzvkM_jxx1kdgB4LOh0PDceKQ2hGNUEWphTLVTga2AX3AzLwP_tXo_8od4svFIlJSza31qNh9cJ75Zmh-5OWC",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCTQd32-LWO00bS_Bi1kGrjbBuWqRTB4AG-7L6SPriHRueh8k_VFzlTYKX535jqJpezqJnvIbqn-UfrC5XapF7VGgkhweaxGxNXZZGMosAXciZiVtkserrsWmVF80UgjO-vg3s9igISDWDUfoi8nm2YSfFX94Io4GzfU5ctOEZ6Pcr7Vuvvo1VZTJvFy8-fhe3jz59LAD1Pu89kFT0kh5WarsNflYbbmglMuDY89P20-_cyk4EZzaKTeYzpvzBGZM8ttf_9TJDwIqft",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBPLZbCgEyf_wK7rdYgoFFTaet0XZXwmwJoAGs_sUiwhtRls4_5ym4sfb2-9vj8hH6Ab7Phjf73tcXwOPR5K3gZSSwOpRxYyiUKyrpRzMxJYrATKanuKO4SH-QGblo7EqLrgG7OOdE3v-sCgC_QLuc8DwpQ8BnHOI4dnETUvmwzJkv_97szSupuom19Kwb5bw1Jn7Qtv9QBQhh5NFuOM1a9C-Z9vpFUI794k8e38QM3MFFyztLAw62DDF7ZQGbwuGw1jVfRfcFRB-_l",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAIeh_lUqhtQnlLaebqvj51AihYIAJJVvU7uGGh1siaZK4QXxj4lR2nI420SKjusVo41ADhNqyjBXj2khQ2o2pFXuc5FpeE3Gdt6-GKtMEzJGYW18HB5ZYjce3H8umDJ59eoellFaOvFY_Y8X0EJxHud-WHM33vzSpxpF0tMe7ldWQgkqBXnIvvlctmAA1oaBVrhtSX0laW8GxIxWpyKSXfYpFNvmGcYqxbjAWAAn3ZJDR2KYMFZ9AHyPZpI9WMnyNnfSk-sL6HEEzA",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDVQ463cRlsFnQF84Vid8KafP6nUm5zUOmhknQlut8b_6giNB0SUr8XQ8yOa94Cx57W9boYwgLhEHUnKN0CiNQtk6m9gqxJy3di_5jIGtFtPzRzvEPic9xNso4tKkngrC0n6G_8LvknoiBoVfsS-LcylvM1xktx-JptFnTmmrjjEHdPc8eRdzmOM0T-NMoJIU11yOf3FdXXCDEeOoexY4ZMH-TzOjVhtl98R4qbGyjVs9c21oVdsk8GiR9Mw5-97TAC7DuIA6GeNZgd",
];

export default function Home() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [heroImages, setHeroImages] = useState<string[]>(defaultHeroImages);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const loadHeroSliderImages = async () => {
      try {
        const response = await fetch("/api/hero-slider", { cache: "no-store" });
        const data = (await response.json()) as { images?: string[] };

        if (!response.ok) {
          return;
        }

        if (data.images && data.images.length > 0) {
          setHeroImages(data.images);
        }
      } catch {
        return;
      }
    };

    void loadHeroSliderImages();
  }, []);

  useEffect(() => {
    if (heroImages.length === 0) {
      return;
    }

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [heroImages.length]);

  const activeSlideIndex = heroImages.length === 0 ? 0 : currentSlide % heroImages.length;

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        const data = (await response.json()) as { authenticated?: boolean };
        setIsAuthenticated(Boolean(data.authenticated));
      } catch {
        setIsAuthenticated(false);
      }
    };

    checkSession();
  }, []);

  const requireAuthNavigation = (pathWhenAuthenticated: string) => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    router.push(pathWhenAuthenticated);
  };

  const handleProtectedListAction = async (product: {
    name: string;
    price?: string;
    image?: string;
    category?: string;
  }) => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    try {
      await fetch("/api/list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(product),
      });
    } catch {
      return;
    }
  };

  return (
    <div className="relative min-h-screen bg-background-light text-primary">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? "bg-white/90 backdrop-blur-md shadow-sm h-20" : "bg-transparent h-24"}`}>
        <div className="content-container h-full flex items-center justify-between gap-12">
          <div className="flex items-center gap-3">
            <span className={`text-2xl font-serif tracking-tight uppercase transition-colors duration-500 ${isScrolled ? "text-primary" : "text-white"}`}>
              ORGANIC<span className="font-light italic">ROOTS</span>
            </span>
          </div>
          
          <div className="hidden md:flex flex-1 max-w-lg relative">
            <input
              className={`w-full border-none rounded-none py-3 px-6 pl-12 focus:ring-1 focus:ring-primary/20 text-xs tracking-wider transition-all placeholder:opacity-70 ${isScrolled ? "bg-slate-100 text-primary placeholder:text-primary/70" : "bg-white/10 text-white placeholder:text-white/70"}`}
              placeholder="SEARCH OUR HARVEST..."
              type="text"
            />
            <span className={`material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-lg transition-colors duration-500 ${isScrolled ? "text-primary/60" : "text-white"}`}>
              search
            </span>
          </div>

          <div className={`flex items-center gap-10 transition-colors duration-500 ${isScrolled ? "text-primary" : "text-white"}`}>
            <button className="flex items-center gap-2 hover:opacity-60 transition-opacity" onClick={() => requireAuthNavigation("/account")}>
              <span className="text-[10px] tracking-widest font-semibold uppercase hidden lg:block">Account</span>
              <span className="material-symbols-outlined text-xl font-light">person</span>
            </button>
            <button className="relative flex items-center gap-2 hover:opacity-60 transition-opacity" onClick={() => requireAuthNavigation("/my-list")}>
              <span className="text-[10px] tracking-widest font-semibold uppercase hidden lg:block">My List</span>
              <span className="material-symbols-outlined text-xl font-light">bookmark</span>
              <span className={`absolute -top-2 -right-3 text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-sm ${isScrolled ? "bg-primary text-white" : "bg-white text-primary"}`}>
                3
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[100vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          {heroImages.map((img, idx) => (
            <img
              key={idx}
              alt={`Premium Organic Produce ${idx + 1}`}
              className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-1000 ${idx === activeSlideIndex ? "opacity-100" : "opacity-0"}`}
              src={img}
            />
          ))}
          <div className="absolute inset-0 bg-black/30"></div>
        </div>
        <div className="content-container relative w-full flex justify-center lg:justify-start">
          <div className="max-w-3xl text-center lg:text-left text-white">
            <span className="block text-[10px] font-bold tracking-[0.3em] uppercase mb-8 text-white/80">
              The Autumn Harvest Selection
            </span>
            <h1 className="text-6xl md:text-8xl font-serif mb-8 leading-[1.1] italic">
              Purity in <br />
              <span className="text-light-cyan font-normal not-italic">Every Harvest</span>
            </h1>
            <p className="text-lg text-white/90 mb-12 max-w-md leading-relaxed font-light mx-auto lg:mx-0">
              Discover a curated collection of artisanal organic produce,
              sourced directly from heritage farms where quality precedes quantity.
            </p>
            <div className="flex flex-col sm:flex-row gap-8 items-center justify-center lg:justify-start">
              <button className="bg-white text-primary px-12 py-5 text-[11px] font-bold tracking-widest uppercase hover:bg-slate-100 transition-all shadow-xl">
                Explore Collection
              </button>
              <button className="btn-elegant !text-white !border-white/30 hover:!border-white">
                View Private Label
              </button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3">
          {heroImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`hero-dot ${idx === activeSlideIndex ? "active" : ""}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-32 bg-white">
        <div className="content-container">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-serif mb-6 italic text-primary">
              Curated Categories
            </h2>
            <div className="w-16 h-px bg-primary/20 mx-auto"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-12">
            {categories.map((cat, idx) => (
              <div key={idx} className="group cursor-pointer text-center">
                <div className="category-circle mx-auto w-32 h-32 rounded-full flex items-center justify-center mb-6 overflow-hidden bg-background-light p-6">
                  <img
                    alt={cat.name}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700"
                    src={cat.image}
                  />
                </div>
                <h3 className="font-serif text-lg italic mb-1 text-primary">{cat.name}</h3>
                <p className="text-[10px] tracking-widest uppercase text-slate-400">
                  {cat.count}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Flash Collection */}
      <section className="py-32 bg-frosted-blue/10">
        <div className="content-container">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="max-w-xl">
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary/60 mb-4 block">
                Limited Opportunity
              </span>
              <h2 className="text-4xl md:text-5xl font-serif italic text-primary">
                The Flash Collection
              </h2>
            </div>
            <div className="flex items-center gap-12">
              <div className="flex gap-8 text-primary">
                <div className="text-center">
                  <span className="block text-2xl font-serif">04</span>
                  <span className="text-[8px] uppercase tracking-widest opacity-60 font-semibold">Days</span>
                </div>
                <div className="text-center">
                  <span className="block text-2xl font-serif">12</span>
                  <span className="text-[8px] uppercase tracking-widest opacity-60 font-semibold">Hours</span>
                </div>
                <div className="text-center">
                  <span className="block text-2xl font-serif">45</span>
                  <span className="text-[8px] uppercase tracking-widest opacity-60 font-semibold">Mins</span>
                </div>
              </div>
              <button className="btn-elegant text-primary">View All Offerings</button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {flashProducts.map((product, idx) => (
              <div key={idx} className="product-card group p-8">
                <div className="aspect-square mb-8 overflow-hidden bg-slate-50 flex items-center justify-center">
                  <img
                    alt={product.name}
                    className="w-3/4 object-contain group-hover:scale-105 transition-transform duration-1000"
                    src={product.image}
                  />
                </div>
                <div className="space-y-4">
                  <p className="text-[9px] tracking-widest uppercase text-slate-400 font-semibold">
                    {product.category}
                  </p>
                  <h3 className="text-xl font-serif italic text-primary">{product.name}</h3>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <span className="text-lg font-light text-primary">{product.price}</span>
                    <button
                      className="btn-elegant text-primary"
                      onClick={() => {
                        void handleProtectedListAction(product);
                      }}
                    >
                      Add to List
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="relative h-[400px] overflow-hidden bg-primary w-full">
        <img
          alt="Delivery Background"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBPLZbCgEyf_wK7rdYgoFFTaet0XZXwmwJoAGs_sUiwhtRls4_5ym4sfb2-9vj8hH6Ab7Phjf73tcXwOPR5K3gZSSwOpRxYyiUKyrpRzMxJYrATKanuKO4SH-QGblo7EqLrgG7OOdE3v-sCgC_QLuc8DwpQ8BnHOI4dnETUvmwzJkv_97szSupuom19Kwb5bw1Jn7Qtv9QBQhh5NFuOM1a9C-Z9vpFUI794k8e38QM3MFFyztLAw62DDF7ZQGbwuGw1jVfRfcFRB-_l"
        />
        <div className="absolute inset-0 promo-overlay"></div>
        <div className="content-container relative h-full flex items-center">
          <div className="flex flex-col md:flex-row items-center justify-between w-full text-white">
            <div className="max-w-lg mb-12 md:mb-0">
              <span className="text-[10px] font-bold tracking-[0.4em] uppercase mb-4 block">
                Complimentary Service
              </span>
              <h2 className="text-5xl font-serif italic mb-2">Free Delivery</h2>
              <p className="text-slate-300 font-light tracking-wide uppercase text-[11px]">
                Throughout the month of February
              </p>
            </div>
            <div className="text-right">
              <div className="border border-white/20 p-8 inline-block backdrop-blur-sm bg-white/5">
                <p className="text-[9px] uppercase tracking-widest mb-2 opacity-60">Private Code</p>
                <p className="text-3xl font-serif tracking-tighter mb-4 italic">FDB2K26</p>
                <button className="btn-elegant !text-white !border-white/40 hover:!border-white">
                  Secure Benefit
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Collection Tiles */}
      <section className="py-32 bg-white">
        <div className="content-container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {collections.map((col, idx) => (
              <div key={idx} className="relative h-72 group cursor-pointer overflow-hidden shadow-sm">
                <img
                  alt={col.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]"
                  src={col.image}
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors"></div>
                <div className="absolute bottom-10 left-10 text-white">
                  <h3 className="text-2xl font-serif italic mb-4">{col.title}</h3>
                  <button className="btn-elegant !text-white !border-white/40">
                    Shop Collection
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Selection */}
      <section className="py-32 bg-white">
        <div className="content-container">
          <div className="flex justify-between items-baseline mb-24 border-b border-slate-100 pb-8">
            <h2 className="text-4xl md:text-5xl font-serif italic text-primary">
              Featured Selection
            </h2>
            <button className="btn-elegant text-primary">View All Offerings</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-20 gap-x-12 mb-32">
            {featuredProducts.map((product, idx) => (
              <div key={idx} className="group">
                <div className="aspect-square bg-slate-50 mb-6 flex items-center justify-center p-12 transition-all group-hover:bg-frosted-blue/20">
                  <img
                    alt={product.name}
                    className="w-full h-full object-contain mix-blend-multiply"
                    src={product.image}
                  />
                </div>
                <p className="text-[9px] tracking-widest uppercase text-slate-400 mb-2 font-semibold">
                  {product.category}
                </p>
                <h4 className="text-xl font-serif mb-1 text-primary">{product.name}</h4>
                <p className="text-[11px] text-slate-400 font-light mb-4">
                  {product.weight}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-light text-primary">{product.price}</span>
                  <button
                    className="btn-elegant text-primary"
                    onClick={() => {
                      void handleProtectedListAction(product);
                    }}
                  >
                    Add to List
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="relative rounded-none overflow-hidden h-80 group shadow-lg">
              <img
                alt="Exclusive Brands"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBPLZbCgEyf_wK7rdYgoFFTaet0XZXwmwJoAGs_sUiwhtRls4_5ym4sfb2-9vj8hH6Ab7Phjf73tcXwOPR5K3gZSSwOpRxYyiUKyrpRzMxJYrATKanuKO4SH-QGblo7EqLrgG7OOdE3v-sCgC_QLuc8DwpQ8BnHOI4dnETUvmwzJkv_97szSupuom19Kwb5bw1Jn7Qtv9QBQhh5NFuOM1a9C-Z9vpFUI794k8e38QM3MFFyztLAw62DDF7ZQGbwuGw1jVfRfcFRB-_l"
              />
              <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px]"></div>
              <div className="absolute inset-0 p-12 flex flex-col justify-center">
                <span className="text-primary/60 font-bold mb-4 uppercase tracking-[0.2em] text-[10px]">
                  Private Selection
                </span>
                <h3 className="text-4xl font-serif italic text-primary mb-8 leading-tight">
                  Exclusive Brands <br />
                  at 30% Privilege
                </h3>
                <button className="btn-elegant w-fit text-primary">Discover Brands</button>
              </div>
            </div>
            <div className="relative rounded-none overflow-hidden h-80 group shadow-lg">
              <img
                alt="Super Sales Vegetables"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCkamhTltGTMMFHxDY9mW6nAKiYE0AXzvNhmSmepISnQ_e87rtr8YgHTmejzxjSCvbsWuRtnpk2yaNWr0BIH2mAuecMBMu5JKVqEIEubgy61iojBkMqRs-Rq_q5oZkTvjBH6UvjZaimj2pBj983iQt7XhFNbFvwx1Q1o5Zjvby6mzlVp56LhuRd69qEgWgOwJZIVIvtLgVNezAAkDotwmS17PEeu9n80RiDmMeqbNCFCYZlzqkcoJxETlH282jLr0a0BQubA2jsK6Ss"
              />
              <div className="absolute inset-0 bg-light-cyan/80 backdrop-blur-[2px]"></div>
              <div className="absolute inset-0 p-12 flex flex-col justify-center">
                <span className="text-primary/60 font-bold mb-4 uppercase tracking-[0.2em] text-[10px]">
                  Harvest Event
                </span>
                <h3 className="text-4xl font-serif italic text-primary mb-8 leading-tight">
                  Super Sales <br />
                  Organic Vegetables
                </h3>
                <button className="btn-elegant w-fit text-primary">Shop Now</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="relative h-[600px] overflow-hidden">
        <video autoPlay className="absolute inset-0 w-full h-full object-cover" loop muted playsInline>
          <source src="/veg.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
          <div className="content-container text-center text-white">
            <h2 className="text-5xl font-serif italic mb-6">From Seed to Plate</h2>
            <p className="text-lg font-light opacity-80 max-w-2xl mx-auto leading-relaxed">
              A cinematic journey through our sustainable practices and heritage farming methods.
            </p>
          </div>
        </div>
      </section>

      {/* Weekly Best Selling */}
      <section className="py-32 bg-background-light">
        <div className="content-container">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-serif italic mb-8 text-primary">
              Weekly Best Selling
            </h2>
            <div className="flex flex-wrap justify-center gap-10">
              <button className="btn-elegant text-primary">Most Popular</button>
              <button className="btn-elegant text-primary/40 hover:text-primary">Featured</button>
              <button className="btn-elegant text-primary/40 hover:text-primary">New Added</button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-12">
            {weeklyProducts.map((product, idx) => (
              <div key={idx} className="text-center group">
                <div className="aspect-square mb-6 bg-white border border-slate-50 p-6 flex items-center justify-center group-hover:shadow-lg transition-all duration-500">
                  <img alt={product.name} className="max-h-full" src={product.image} />
                </div>
                <h4 className="font-serif italic text-lg mb-2 text-primary">{product.name}</h4>
                <p className="text-primary font-medium mb-6">{product.price}</p>
                <button
                  className="btn-elegant text-primary"
                  onClick={() => {
                    void handleProtectedListAction(product);
                  }}
                >
                  Add to List
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-light-cyan/20">
        <div className="content-container">
          <div className="grid grid-cols-1 lg:grid-cols-3 items-center gap-16 mb-40">
            <div className="space-y-12 text-right">
              {[
                { icon: "verified", title: "Handmade Products", desc: "Crafted with care using traditional methods.", color: "bg-yellow-100 text-yellow-600" },
                { icon: "potted_plant", title: "Organic and Fresh", desc: "Straight from heritage farms.", color: "bg-green-100 text-green-600" },
                { icon: "thermostat", title: "Temperature Control", desc: "Preserving nutrients through logistics.", color: "bg-orange-100 text-orange-600" },
              ].map((f, i) => (
                <div key={i} className="flex flex-row-reverse items-start gap-6">
                  <div className={`feature-icon-circle ${f.color}`}>
                    <span className="material-symbols-outlined">{f.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-serif mb-2 text-primary">{f.title}</h3>
                    <p className="text-sm text-slate-500 font-light leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-center">
              <div className="relative w-80 h-80 md:w-[450px] md:h-[450px] rounded-full overflow-hidden shadow-2xl border-8 border-white">
                <img
                  alt="Fresh Vegetable Splash"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDC7hjJ81FJnujXzosLBwnZL4nAxoY0lc-NmPKY_DafjyUWuoPRQFc4YFwx--1-uo-irrvvjeCZZk7-GSZ9TTakl9Qi_4Zzg2G7i56o0b41-JUx_MmUuT7uPV4JAiHlOL6rWoUtLJv1f0sOBcLiDCy5AZL01z9wO0cLM0-MEkB9a1w23jF-JHX6mhEqDuI_u8agAm25ESXq5WZDW_mZT9F9vi-QIjNg9Kg2THCri90nWgEMv6maKsqGAHSPOvtCJQSh6SfPoNj-ICvw"
                />
              </div>
            </div>

            <div className="space-y-12">
              {[
                { icon: "shopping_basket", title: "150+ Organic Items", desc: "A wide curated variety for every need.", color: "bg-blue-100 text-blue-600" },
                { icon: "shield", title: "100% Secure Payment", desc: "Encrypted transactions for peace of mind.", color: "bg-purple-100 text-purple-600" },
                { icon: "speed", title: "Super Fast Delivery", desc: "Efficient fulfillment to your door.", color: "bg-red-100 text-red-600" },
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-6">
                  <div className={`feature-icon-circle ${f.color}`}>
                    <span className="material-symbols-outlined">{f.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-serif mb-2 text-primary">{f.title}</h3>
                    <p className="text-sm text-slate-500 font-light leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-md rounded-[40px] p-8 md:p-16 flex flex-col lg:flex-row items-center justify-between gap-12 overflow-hidden shadow-sm border border-white">
            <div className="max-w-xl text-center lg:text-left">
              <h2 className="text-4xl md:text-5xl font-serif text-primary mb-6 leading-tight italic">
                We Make Your Daily Life <br /> More Easy
              </h2>
              <p className="text-slate-500 mb-10 font-light">
                Subscribe to our newsletter and enjoy with our natural organic food updates and exclusive deals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full sm:w-auto">
                  <input
                    className="w-full px-8 py-5 rounded-full border border-slate-100 bg-white shadow-sm focus:ring-2 focus:ring-primary/10 text-sm font-light text-primary"
                    placeholder="Your email address"
                    type="email"
                  />
                </div>
                <button className="bg-primary text-white px-10 py-5 rounded-full text-xs font-bold tracking-widest uppercase hover:bg-primary-dark transition-colors shrink-0 shadow-lg">
                  Start Shopping
                </button>
              </div>
            </div>
            <div className="relative w-full lg:w-1/3 flex justify-center lg:justify-end">
              <div className="bg-[#fff9f0] p-10 rounded-2xl shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-500 max-w-[280px]">
                <p className="text-[10px] opacity-60 uppercase text-center mb-6 font-bold tracking-widest">Daily Grocer</p>
                <img
                  alt="Daily Grocer Card"
                  className="w-full mb-6 mix-blend-multiply"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDC7hjJ81FJnujXzosLBwnZL4nAxoY0lc-NmPKY_DafjyUWuoPRQFc4YFwx--1-uo-irrvvjeCZZk7-GSZ9TTakl9Qi_4Zzg2G7i56o0b41-JUx_MmUuT7uPV4JAiHlOL6rWoUtLJv1f0sOBcLiDCy5AZL01z9wO0cLM0-MEkB9a1w23jF-JHX6mhEqDuI_u8agAm25ESXq5WZDW_mZT9F9vi-QIjNg9Kg2THCri90nWgEMv6maKsqGAHSPOvtCJQSh6SfPoNj-ICvw"
                />
                <p className="text-[10px] opacity-60 uppercase text-center italic tracking-widest">Minimalist Lifestyle</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white pt-32 pb-12">
        <div className="content-container">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-20 mb-32">
            <div className="col-span-1 lg:col-span-1">
              <span className="text-2xl font-serif tracking-tight text-white mb-10 block uppercase">
                ORGANIC<span className="font-light italic">ROOTS</span>
              </span>
              <p className="text-slate-400 font-light leading-relaxed mb-10 text-sm">
                Defining the standards of organic excellence since 1994. From heritage farms to your residence.
              </p>
              <div className="flex gap-8">
                <a className="opacity-50 hover:opacity-100 transition-opacity" href="#"><span className="material-symbols-outlined font-light">public</span></a>
                <a className="opacity-50 hover:opacity-100 transition-opacity" href="#"><span className="material-symbols-outlined font-light">mail</span></a>
              </div>
            </div>
            {[
              { title: "Collections", items: ["Heritage Meats", "Orchard Selection", "Artisan Pantry", "Private Label"] },
              { title: "Concierge", items: ["Shipping Ethics", "Sourcing Quality", "Contact Us", "FAQ"] }
            ].map((section, idx) => (
              <div key={idx}>
                <h4 className="text-sm font-bold tracking-widest uppercase mb-10">{section.title}</h4>
                <ul className="space-y-6 text-slate-400 text-sm font-light">
                  {section.items.map((item, i) => (
                    <li key={i}><a className="hover:text-white transition-colors" href="#">{item}</a></li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <h4 className="text-sm font-bold tracking-widest uppercase mb-10">Newsletter</h4>
              <p className="text-slate-400 text-xs font-light mb-8 leading-relaxed">Join our inner circle for seasonal harvest updates and private offerings.</p>
              <div className="relative">
                <input
                  className="w-full bg-transparent border-b border-white/20 py-4 focus:border-white transition-colors outline-none text-sm placeholder:text-white/20 text-white"
                  placeholder="Email Address"
                  type="email"
                />
                <button className="absolute right-0 top-4 text-xs font-bold tracking-widest uppercase hover:text-light-cyan transition-colors">Join</button>
              </div>
            </div>
          </div>
          <div className="py-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] tracking-widest text-slate-500 uppercase">
            <p>copyrights © 2026 OrganicRoots. All rights reserved Jathursika Velummayilum.</p>
            <div className="flex items-center gap-8 grayscale opacity-30">
              <img alt="Visa" className="h-3" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAUHdLemp-vs9mQ7vv_nGJMdmZfUCTmR70QIQ0VnIcuAAbh6U5dfx9PRTb6jxXhZHxPsxNJZyh1ZfNJ-gU2kpqPR_bGtrrd-EdLpNZIlamB2SR7Ws6v84WPbl9kaduYvYkPrBpBPmhe-MOKfGaf0HMYrmhe8byMpln2aMW2EIIR8OG2RagIs8_KVFnh14wI4G0mHE9zcnW0h7SrDjI--kNIdQfbVqo02hF_XMyqa_rXshYHOZtvRlcKutcZz91BQ2ACnyF256fvDlqR" />
              <img alt="Mastercard" className="h-4" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDjj4elOIZQMS9V8pdLswkrT2aq4fjpdvt8oZEL4VymJpUsmxcbq0m2EZsCvAYU8ycyDBNxFMla41ybfWZADQNfT3P3vRtlfy7FUYhYZEwE3zZkafDNVpn3K0WDb3Z8r0ES0hLCIprq0Elh7tVsl75T4WFXXXagkv2hAZpnklUwBj6pL_3S6OGAcrTPYvy1Y-6LFcixrg7Ab1RgeyA8Kf-d2wTH7h-t9mGXbK5Gly38a8ydpmiZcvdlOMg2r6KrzWjxco51pzrp2vSt" />
              <img alt="Paypal" className="h-3" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDXZ6jw03Uf7JjvFhS0fvzohceFq-L9r_p9KIkM4VYbGlNkcMZCX_QYqd0d-F-8gpHJW79gJ8xYKvV_qz1UcewYdtwAtGF2vszIXgtylOgilxSuFbuu7k1x0cxqJrsi-s2hKZTfh36ZQuVRicPo2YhVjO2sKoc8fZ6sQHkn4Yxiw4G_njDYTAF0qq1g__ww_0cSqSQ5rSGJwcE6HwyWjUMvFy-KSi1ZJ5p5BAFVex6juypyFPKxxzKGcNulcbzBqmeTYCLE9qDrMdtm" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
