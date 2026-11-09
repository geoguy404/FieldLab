<p align="center"><img src="./FieldLab.svg" alt="Logo" width="400"></p>

<h1 align="center">FieldLab</h1>

<p align="center">
  <img src="https://hackatime.hackclub.com/api/v1/badge/U0CA5LSU9LL/geoguy404/FieldLab" alt="Hackatime">
  <img src="https://img.shields.io/badge/Status-In_Development-yellow" alt="Available for">
  <img src="https://img.shields.io/badge/Made_for-Hack_Club-red" alt="License">
  <img src="https://img.shields.io/badge/Hosted_on-GitHub_Pages-green" alt="Status">
</p>

## Description
FieldLab is an interactive physics simulator for exploring electric and magnetic fields, electromagnetic waves in the browser. Experiment with charges, visualize field lines, and discover how electric and magnetic fields interact.

## Try it out!
https://geoguy404.github.io/FieldLab/

## Features

- Create charges and visualize the field lines
- Simulate the interaction of more than one charge
- Field lines are displayed on a 2D plane
- move the charges around and see how the field lines change
- Change the magnitude of each individual charge

## Physics

### Electric Field of a Point Charge
$$
\vec{E}(\vec{r}) =
k \cdot Q \cdot
\frac{\vec{r}-\vec{r}_Q}
{|\vec{r}-\vec{r}_Q|^3}
$$

### Field Components

$$
E_x = k \cdot Q \cdot \frac{x-x_Q}{r^3}
$$

$$
E_y = k \cdot Q \cdot \frac{y-y_Q}{r^3}
$$

### Superposition Principle

$$
\vec{E}_{\mathrm{total}} =
\sum_{i=1}^{n} \vec{E}_i
$$

## Running locally

```bash
git clone https://github.com/geoguy404/FieldLab
cd fieldlab
npm install
npm run dev
```

## Build with

- VSCode
- Pyodide
- LateX
