import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import image1 from '@/assets/photos/registration1.jpg';
import image2 from '@/assets/photos/registration2.jpg';
import image3 from '@/assets/photos/registration3.jpg';

const images = [image1, image2, image3];

function ImageCarousel() {
    return (
        <div className="w-full h-full rounded-lg overflow-hidden shadow-lg">
            <Swiper
                modules={[Pagination, Autoplay]}
                spaceBetween={0}
                slidesPerView={1}
                loop={true}
                pagination={{ clickable: true }}
                autoplay={{
                    delay: 8000,
                    disableOnInteraction: false,
                }}
            >
                {/* map 动态生成幻灯片的部分保持不变 */}
                {images.map((image, index) => (
                    <SwiperSlide key={index}>
                        <img
                            src={image}
                            alt={`Carousel slide ${index + 1}`}
                            className="w-full h-full object-cover"
                        />
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
}

export default ImageCarousel;