# Costeo - Sistema de Cotización para Eventos Gastronómicos

Una aplicación web profesional y moderna para cotizar eventos gastronómicos en San Miguel de Tucumán. Diseñada para ser intuitiva, rápida y visualmente impecable.

## 🚀 Características

- **Motor de cotización paramétrico inteligente** basado en tipo de menú, cantidad de personas, nivel de servicio y urgencia
- **Clasificación automática con IA** para detectar categorías de menú desde texto libre
- **Interfaz premium y moderna** con diseño responsive pensado para uso móvil
- **Cálculos transparentes** con breakdown detallado y rangos estimados
- **Guardado de presupuestos** en localStorage
- **Configuración editable** de precios base y parámetros

## 🛠️ Tecnologías

- **React 18** con TypeScript
- **Tailwind CSS** para estilos modernos
- **Lucide React** para iconos
- **Motor de cálculo paramétrico** personalizado

## 📦 Instalación

1. Clonar el repositorio
2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Iniciar el servidor de desarrollo:
   ```bash
   npm start
   ```

4. Abrir [http://localhost:3000](http://localhost:3000) en el navegador

## 🎯 Uso

1. **Seleccionar tipo de menú**: Escriba el tipo de evento o seleccione una categoría
2. **Configurar parámetros**: 
   - Cantidad de personas
   - Nivel de servicio (básico, estándar, premium)
   - Urgencia del evento
   - Servicios adicionales
   - Ajuste por inflación
3. **Calcular**: Presione el botón para obtener el presupuesto
4. **Resultados**: Ver precio total, por persona, rangos y breakdown
5. **Guardar o copiar**: Guarde el presupuesto o copie los resultados

## 📊 Categorías Disponibles

- Cocktail / Recepción
- Buffet / Lunch  
- Principal / Plato Fuerte
- Infantil
- Brunch / Desayuno
- Postre / Mesa Dulce
- Fin de Fiesta
- Vegetariano / Vegano
- Premium / Gourmet
- Coffee Break

## 💡 Motor de Cálculo

El sistema utiliza una fórmula paramétrica:

```
precio_total = base_categoria * factor_personas * factor_servicio * factor_urgencia * factor_extras * factor_inflacion
```

Con ajustes por:
- Descuento por escala en eventos grandes
- Recargo por eventos pequeños  
- Recargo por urgencias
- Recargo por servicios premium

## 🎨 Diseño

- **Minimalista y elegante** con colores sobrios
- **Tarjetas con sombras suaves** y bordes redondeados
- **Tipografía grande y legible**
- **Animaciones sutiles** y microinteracciones
- **Responsive-first** para móviles

## 🔧 Configuración

Los precios base y parámetros son fácilmente editables desde:
- `src/data/categories.ts` - Precios base por categoría
- `src/config/appConfig.ts` - Configuración general
- `src/utils/pricingEngine.ts` - Motor de cálculo

## 📱 Características Mobile

- Diseño optimizado para uso en móviles
- Botones grandes y fáciles de tocar
- Navegación simple e intuitiva
- Formularios adaptados a pantallas pequeñas

## 🚀 Deploy

Para producción:

```bash
npm run build
```

Los archivos generados estarán en la carpeta `build/`.

## 📄 Licencia

Proyecto privado para uso interno de la empresa de eventos gastronómicos.

---

**Desarrollado para eventos gastronómicos en San Miguel de Tucumán** 🇦🇷
