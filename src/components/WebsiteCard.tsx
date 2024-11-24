// Importación de dependencias necesarias
import React from 'react';
import { FaTimes, FaExternalLinkAlt, FaGithub } from 'react-icons/fa'; // Íconos de React Icons
import { Website } from '../types'; // Importación del tipo 'Website' desde los tipos personalizados

// Definición de las propiedades que recibirá el componente 'WebsiteCard'
interface Props {
  website: Website; // El sitio web que se mostrará en la tarjeta
  onRemove: () => void; // Función para eliminar el sitio web
  isDark: boolean; // Determina si el tema es oscuro
}

// Componente funcional que representa una tarjeta con un sitio web
export function WebsiteCard({ website, onRemove, isDark }: Props) {
  return (
    // El contenedor principal de la tarjeta, es un enlace que abre el sitio web en una nueva pestaña
    <a
      href={website.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative h-64 w-72 rounded-2xl overflow-hidden transition-all transform hover:scale-105 ${
        isDark
          ? 'bg-gradient-to-br from-purple-800 to-blue-900 hover:from-purple-700 hover:to-blue-800'
          : 'bg-gradient-to-br from-white to-gray-200 hover:from-white hover:to-gray-300'
      } backdrop-blur-xl border border-transparent hover:border-indigo-500 hover:shadow-2xl`}
    >
      {/* Botón para eliminar el sitio web, aparece al hacer hover */}
      <button
        onClick={(e) => {
          e.preventDefault();
          onRemove();
        }}
        className="absolute top-3 right-3 p-2 rounded-full bg-black/30 hover:bg-black/50 opacity-0 group-hover:opacity-100 transition-all z-10"
      >
        {/* Ícono de cerrar (X) */}
        <FaTimes className="w-5 h-5 text-white transform rotate-45" />
      </button>

      {/* Ícono del sitio web en la esquina superior izquierda */}
      <div className="absolute top-4 left-4 p-2 rounded-full bg-gradient-to-br from-gray-800/50 to-gray-900/50">
        <span className="text-3xl">{website.icon}</span>
      </div>

      {/* Contenido de la tarjeta */}
      <div className="h-full flex flex-col justify-end p-5">
        <div className={`${isDark ? 'text-white' : 'text-gray-900'} text-sm font-medium`}>
          <h3 className="text-xl font-bold mb-1">{website.name}</h3>
          <p className="text-sm opacity-70 truncate">{website.url}</p>
        </div>

        {/* Ícono de enlace externo, aparece al hacer hover */}
        <div
          className={`absolute right-4 bottom-4 p-2 rounded-full transform hover:scale-125 transition-all ${
            isDark ? 'bg-white/20' : 'bg-gray-800/20'
          } opacity-0 group-hover:opacity-100`}
        >
          <FaExternalLinkAlt
            className={`w-5 h-5 ${isDark ? 'text-white' : 'text-gray-800'} transition-all`}
          />
        </div>

        {/* Ícono de GitHub, aparece al hacer hover */}
        <div
          className={`absolute left-4 bottom-4 p-2 rounded-full transform hover:scale-125 transition-all ${
            isDark ? 'bg-white/20' : 'bg-gray-800/20'
          } opacity-0 group-hover:opacity-100`}
        >
          <a
            href="https://github.com/devlewiso/WebRadar.git"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaGithub
              className={`w-5 h-5 ${isDark ? 'text-white' : 'text-gray-800'} transition-all`}
            />
          </a>
        </div>
      </div>
    </a>
  );
}
