import { Service } from './types';

interface ServiceCardProps {
  service: Service;
}

export const ServiceCard = ({ service }: ServiceCardProps) => {
  return (
    <div className="flex-shrink-0 sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 p-4 transition-transform duration-300">
      <div className="rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 bg-white dark:bg-gray-800 cursor-pointer">
        <div className="relative overflow-hidden">
          <img
            src={service.images?.[0] || "/placeholder-image.jpg"}
            alt={service.name}
            className="w-full h-48 object-cover transition-transform duration-300 hover:scale-110"
          />
          <div className="absolute inset-0 bg-black opacity-0 hover:opacity-10 transition-opacity duration-300"></div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg text-gray-800 dark:text-white">
            {service.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
            {service.description}
          </p>
        </div>
      </div>
    </div>
  );
};