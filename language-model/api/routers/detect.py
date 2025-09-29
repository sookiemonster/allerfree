from fastapi import APIRouter

router = APIRouter(
    prefix="/detect",
    # # dependencies=[],
    # responses={404: {"description": "Not found"}},
)


@router.get("/menu_image/", tags=["detection"])
async def menu_image():
    return "Detecting!"