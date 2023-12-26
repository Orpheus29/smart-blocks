function placeBlocks(inputBlocks, containerSize) {
  const blocks = inputBlocks.map((block, i) => ({ ...block, initialOrder: i + 1 }));
  blocks.sort((a, b) => b.width * b.height - a.width * a.height);

  const blockCoordinates = [];
  let fullness = 0;

  function tryPlaceBlock(block) {
    function placeBlockInContainer(x, y, block) {
      function isOverlap(block, coordinates) {
        return coordinates.some(coord =>
          block.left < coord.right &&
          block.right > coord.left &&
          block.top < coord.bottom &&
          block.bottom > coord.top
        );
      }

      const newBlock = {
        top: y - block.height,
        left: x,
        right: x + block.width,
        bottom: y,
        initialOrder: block.initialOrder,
      };

      if (!isOverlap(newBlock, blockCoordinates)) {
        blockCoordinates.push(newBlock);
        return true;
      }

      return false;
    }

    let placed = false;

    for (let i = 0; i < 2; i++) {
      if (!placed) {
        for (let y = containerSize.height; y >= block.height; y--) {
          for (let x = 0; x <= containerSize.width - block.width; x++) {
            if (placeBlockInContainer(x, y, block)) {
              placed = true;
              break;
            }
          }
          if (placed) break;
        }
      }

      [block.width, block.height] = [block.height, block.width];
    }

    if (!placed) {
      let errorList = document.querySelector('.errorList');

      if (!errorList) {
        errorList = document.createElement('div');
        errorList.className += 'output errorList';
        container.appendChild(errorList);
      }

      const errorMessage = document.createElement('p');
      errorMessage.className = 'errorMessage';
      errorMessage.innerText = `Блок номер ${block.initialOrder} не умістився в даному контейнері`;
      errorList.appendChild(errorMessage);
    }
  }

  blocks.forEach(tryPlaceBlock);

  const totalBlockArea = blocks.reduce((acc, block) => acc + block.width * block.height, 0);
  const emptySpace = containerSize.width * containerSize.height - totalBlockArea;

  if (!document.querySelector('.errorList')) {
    fullness = 1 - emptySpace / (emptySpace + totalBlockArea);
  }

  return { fullness, blockCoordinates };
}

function createBlockElement(block, blockColors) {
  function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }

    return color;
  }

  const blockElement = document.createElement('div');
  blockElement.className = 'block';
  blockElement.style.width = block.right - block.left + 'px';
  blockElement.style.height = block.bottom - block.top + 'px';
  blockElement.style.top = block.top + 'px';
  blockElement.style.left = block.left + 'px';

  const sizeKey = `${blockElement.style.width}_${blockElement.style.height}`;
  const sizeKeyAlt = `${blockElement.style.height}_${blockElement.style.width}`;

  const color = blockColors[sizeKey] || blockColors[sizeKeyAlt] || (blockColors[sizeKey] = getRandomColor());

  blockElement.style.backgroundColor = color;

  const textWrapper = document.createElement('p');
  textWrapper.className = 'block-number';
  textWrapper.innerText = block.initialOrder;

  blockElement.appendChild(textWrapper);

  return blockElement;
}

function updateResult() {
  container.innerHTML = '';

  containerSize = fetchContainerSize();

  const updatedResult = placeBlocks(blocks, containerSize);

  console.log(updatedResult);

  updatedResult.blockCoordinates.forEach((block) => {
    const blockElement = createBlockElement(block, blockColors);
    container.appendChild(blockElement);
  });

  const fullnessInfo = document.createElement('p');
  fullnessInfo.className += 'output fullness';

  if (!updatedResult.fullness) {
    fullnessInfo.classList.add('error-fullness');
  }

  fullnessInfo.innerText = `Fullness: ${updatedResult.fullness ? updatedResult.fullness.toFixed(2) : 0}`;
  container.appendChild(fullnessInfo);
}

function fetchContainerSize() {
  return {
    width: window.innerWidth - 1,
    height: window.innerHeight - 1,
  };
}

window.addEventListener('load', updateResult);
window.addEventListener('resize', updateResult);

let containerSize = fetchContainerSize();

const container = document.body;
const blockColors = {};

async function fetchBlocks() {
  try {
    const response = await fetch('blocks.json');
    const blocks = await response.json();
    return blocks;
  } catch (error) {
    console.error('Error reading blocks.json:', error);
  }
}

const blocks = await fetchBlocks();
