export interface ColoracaoArea {
  name: string;
  points: number[][];
  color: string;
  strokeColor: string;
}

export const COLORACAO_AREAS: ColoracaoArea[] = [
  {
    name: 'Verão Claro',
    points: [[0, 100], [25, 75], [50, 70], [50, 100]],
    color: '#000000ff',
    strokeColor: '#ffffffff',
  },
  {
    name: 'Verão Frio',
    points: [[0, 100], [0, 50], [30, 50], [25, 75]],
    color: '#000000ff',
    strokeColor: '#ffffffff',
  },
  {
    name: 'Verão Suave',
    points: [[25, 75], [30, 50], [50, 50], [50, 70]],
    color: '#000000ff',
    strokeColor: '#ffffffff',
  },
  {
    name: 'Primavera Clara',
    points: [[50, 100], [50, 70], [75, 75], [100, 100]],
    color: '#000000ff',
    strokeColor: '#ffffffff',
  },
  {
    name: 'Primavera Quente',
    points: [[75, 75], [70, 50], [100, 50], [100, 100]],
    color: '#000000ff',
    strokeColor: '#ffffffff',
  },
  {
    name: 'Primavera Brilhante',
    points: [[50, 70], [50, 50], [70, 50], [75, 75]],
    color: '#000000ff',
    strokeColor: '#ffffffff',
  },
  {
    name: 'Inverno Frio',
    points: [[0, 50], [0, 0], [25, 25], [30, 50]],
    color: '#000000ff',
    strokeColor: '#ffffffff',
  },
  {
    name: 'Inverno Escuro',
    points: [[25, 25], [0, 0], [50, 0], [50, 30]],
    color: '#000000ff',
    strokeColor: '#ffffffff',
  },
  {
    name: 'Inverno Brilhante',
    points: [[30, 50], [25, 25], [50, 30], [50, 50]],
    color: '#000000ff',
    strokeColor: '#ffffffff',
  },
  {
    name: 'Outono Escuro',
    points: [[50, 30], [50, 0], [100, 0], [75, 25]],
    color: '#000000ff',
    strokeColor: '#ffffffff',
  },
  {
    name: 'Outono Quente',
    points: [[70, 50], [75, 25], [100, 0], [100, 50]],
    color: '#000000ff',
    strokeColor: '#ffffffff',
  },
  {
    name: 'Outono Suave',
    points: [[50, 50], [50, 30], [75, 25], [70, 50]],
    color: '#000000ff',
    strokeColor: '#ffffffff',
  },
];