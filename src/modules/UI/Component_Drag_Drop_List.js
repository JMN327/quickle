export default function Add_Component_Drag_Drop_Container(
  gridContainer,
  nonGrabClassArr
) {
  gridContainer.classList.add("grid-container");
  const gridContainerStyles = getComputedStyle(gridContainer);
  let gap = parseInt(gridContainerStyles.getPropertyValue("gap"));
  let paddingLeft = parseInt(
    gridContainerStyles.getPropertyValue("padding-left")
  );

  const dragDropEvent = new Event("dragDrop");

  let item = null;
  let itemToLeft = null;
  let itemToLeftLeftX = null;
  let itemToRight = null;
  let itemToRightRightX = null;
  let gridContainerLeft = null;
  let pointerOffset = null;
  let initialItemPosX = null;
  let itemContainerLeftX = null;
  let itemContainerRightX = null;
  let itemLocalPosX = null;
  let switchOffset = 0;
  let animating = false;

  gridContainer.addEventListener("dragstart", (event) => {
    event.preventDefault();
  });

  gridContainer.addEventListener("mousedown", (event) => pickUpGridItem(event));
  document.body.addEventListener("mousemove", (event) => moveGridItem(event));
  document.body.addEventListener("mouseup", (event) => releaseGridItem(event));

/*   gridContainer.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  }); */

  document.body.addEventListener("mouseleave", (event) => {
    if (event.buttons == 1) {
      releaseGridItem(event);
    }
  });

  function pickUpGridItem(event) {
    let earlyExitCheck = nonGrabClassArr.some((CssClass) =>
      event.target.classList.contains(CssClass)
    );

    if (earlyExitCheck) {
      return;
    }

    item = event.target.closest(".grid-item");

    if (!item) {
      return;
    }
    if (event.buttons !== 1) {
      return;
    }
    if (animating) {
      return;
    }

    item.style.zIndex = 1000;
    gridContainerLeft = gridContainer.getBoundingClientRect().left;
    initialItemPosX = item.getBoundingClientRect().left;
    pointerOffset = event.clientX - initialItemPosX;
    getImmediateSiblings(item);
  }

  function moveGridItem(event) {
    event.preventDefault();
    if (!item) {
      return;
    }
    if (animating) {
      return;
    }
    if (event.buttons !== 1) {
      return;
    }
    item.classList.add("moving");
    itemContainerLeftX = event.clientX - pointerOffset - gridContainerLeft;
    itemContainerRightX = itemContainerLeftX + item.offsetWidth;

    //swap if further left than item to left
    if (itemToLeft) {
      if (itemContainerLeftX <= itemToLeftLeftX) {
        let itemWidthSnapshot = itemToLeft.offsetWidth;
        switchOffset += gap + itemWidthSnapshot;
        item.parentNode.insertBefore(item, itemToLeft);
        getImmediateSiblings(item);

        animateSnap(itemToRight, -itemWidthSnapshot, 0, 150);
      }
    }

    //swap if further right than item to right
    if (itemToRight) {
      if (itemContainerRightX >= itemToRightRightX) {
        let itemWidthSnapshot = itemToRight.offsetWidth;
        switchOffset -= gap + itemWidthSnapshot;
        item.parentNode.insertBefore(item, itemToRight.nextElementSibling);
        getImmediateSiblings(item);

        animateSnap(itemToLeft, itemWidthSnapshot, 0, 150);
      }
    }

    itemLocalPosX =
      event.clientX - initialItemPosX + switchOffset - pointerOffset;

    //set the actual position of the grid-item
    if (itemContainerRightX < item.offsetWidth) {
      /* item.parentNode.prepend(item); */
      itemLocalPosX = -paddingLeft;
    } else if (
      itemContainerLeftX >
      gridContainer.offsetWidth - item.offsetWidth
    ) {
      /* item.parentNode.append(item); */
      itemLocalPosX = paddingLeft;
    }
    item.style.left = itemLocalPosX + "px";

    getImmediateSiblings(item);
  }

  function releaseGridItem(event) {
    if (!item) {
      return;
    }
    if (event.button !== 0) {
      return;
    }
    const snapAnimation = animateSnap(item, 0, -itemLocalPosX, 150);
    snapAnimation.onfinish = () => {
      item.style.left = null;
      item.style.zIndex = null;
      item.classList.remove("moving");
      item = null;
      itemToLeft = null;
      itemToLeftLeftX = null;
      itemToRight = null;
      itemToRightRightX = null;
      gridContainerLeft = null;
      pointerOffset = null;
      initialItemPosX = null;
      itemContainerLeftX = null;
      itemLocalPosX = null;
      switchOffset = 0;
      animating = false;
    };
    return gridContainer.dispatchEvent(dragDropEvent);
  }

  function getImmediateSiblings(currentItem) {
    itemToLeft = currentItem.previousElementSibling;
    itemToRight = currentItem.nextElementSibling;
    if (itemToLeft) {
      itemToLeftLeftX = itemToLeft.getBoundingClientRect().left - gridContainerLeft;
    }
    if (itemToRight) {
      itemToRightRightX =
        itemToRight.getBoundingClientRect().left +
        itemToRight.offsetWidth -
        gridContainerLeft;
    }
  }

  function animateSnap(thisItem, startPosition, endPosition, durationMS) {
    const snap = [
      { transform: `translate(${startPosition}px, 0px)` },
      { transform: `translate(${endPosition}px, 0px)` },
    ];
    const snapTiming = {
      duration: durationMS,
    };
    return thisItem.animate(snap, snapTiming);
  }
}

export function Add_Component_Drag_Drop_Item(gridItem) {
  gridItem.classList.add("grid-item");
}
