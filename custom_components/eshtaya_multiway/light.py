"""Light platform for Eshtaya Multi-Way Control."""
from __future__ import annotations

from collections import Counter
from typing import Any

from homeassistant.components.light import (
    ATTR_BRIGHTNESS,
    ATTR_COLOR_TEMP_KELVIN,
    ATTR_EFFECT,
    ATTR_FLASH,
    ATTR_HS_COLOR,
    ATTR_RGB_COLOR,
    ATTR_RGBW_COLOR,
    ATTR_RGBWW_COLOR,
    ATTR_TRANSITION,
    ATTR_WHITE,
    ATTR_XY_COLOR,
    ColorMode,
    LightEntity,
    LightEntityCapabilityAttribute,
    LightEntityFeature,
    LightEntityStateAttribute,
    filter_supported_color_modes,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import ATTR_ASSUMED_STATE, EntityStateAttribute, STATE_ON
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .const import (
    DATA_RUNTIME,
    DOMAIN,
    SIGNAL_GROUPS_UPDATED,
    SIGNAL_SMART_GROUPS_UPDATED,
    SMART_KIND_VIRTUAL,
    VIRTUAL_LIGHT,
)
from .entity import MultiWayEntity
from .smart_entity import SmartGroupEntity


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Set up virtual light entities dynamically."""
    known_multi: set[str] = set()
    known_smart: set[str] = set()

    @callback
    def add_multi() -> None:
        store = hass.data[DOMAIN][DATA_RUNTIME]["store"]
        entities = []
        for group in store.groups():
            if group["virtual_type"] == VIRTUAL_LIGHT and group["id"] not in known_multi:
                known_multi.add(group["id"])
                entities.append(MultiWayVirtualLight(hass, group["id"]))
        if entities:
            async_add_entities(entities)

    @callback
    def add_smart() -> None:
        store = hass.data[DOMAIN][DATA_RUNTIME]["smart_store"]
        entities = []
        for group in store.groups():
            if (
                group["kind"] == SMART_KIND_VIRTUAL
                and group["virtual_type"] == VIRTUAL_LIGHT
                and group["id"] not in known_smart
            ):
                known_smart.add(group["id"])
                entities.append(SmartGroupVirtualLight(hass, group["id"]))
        if entities:
            async_add_entities(entities)

    add_multi()
    add_smart()
    entry.async_on_unload(
        async_dispatcher_connect(hass, SIGNAL_GROUPS_UPDATED, add_multi)
    )
    entry.async_on_unload(
        async_dispatcher_connect(hass, SIGNAL_SMART_GROUPS_UPDATED, add_smart)
    )


class MultiWayVirtualLight(MultiWayEntity, LightEntity):
    _attr_translation_key = "group_control"

    def __init__(self, hass: HomeAssistant, group_id: str) -> None:
        super().__init__(hass, group_id, "control_light")

    def _still_expected(self, group) -> bool:
        return group is not None and group["virtual_type"] == VIRTUAL_LIGHT

    @property
    def is_on(self) -> bool | None:
        state = self.manager.status(self.group_id).get("desired_state")
        return True if state == "on" else False if state == "off" else None

    async def async_turn_on(self, **kwargs) -> None:
        await self.manager.async_request_state(
            self.group_id,
            "on",
            source=self.entity_id or "virtual_light",
            origin="virtual_entity",
        )

    async def async_turn_off(self, **kwargs) -> None:
        await self.manager.async_request_state(
            self.group_id,
            "off",
            source=self.entity_id or "virtual_light",
            origin="virtual_entity",
        )


class SmartGroupVirtualLight(SmartGroupEntity, LightEntity):
    """Represent a virtual Smart Group as a native Home Assistant light."""

    _attr_translation_key = "smart_group_control"

    def __init__(self, hass: HomeAssistant, group_id: str) -> None:
        super().__init__(hass, group_id, "control_light")

    def _still_expected(self, group) -> bool:
        return bool(
            group
            and group["kind"] == SMART_KIND_VIRTUAL
            and group["virtual_type"] == VIRTUAL_LIGHT
        )

    def _member_states(self) -> list:
        group = self.group or {}
        return [
            state
            for member in group.get("members", [])
            if member.get("enabled", True)
            and member.get("entity_id", "").startswith("light.")
            and (state := self.hass.states.get(member["entity_id"])) is not None
        ]

    def _on_member_states(self) -> list:
        return [state for state in self._member_states() if state.state == STATE_ON]

    @staticmethod
    def _mean_numeric(states: list, attribute: str) -> int | None:
        values = [state.attributes.get(attribute) for state in states]
        values = [value for value in values if isinstance(value, (int, float))]
        if not values:
            return None
        return int(sum(values) / len(values))

    @staticmethod
    def _mean_tuple(states: list, attribute: str) -> tuple | None:
        values = [state.attributes.get(attribute) for state in states]
        values = [value for value in values if isinstance(value, (list, tuple)) and value]
        if not values:
            return None
        width = min(len(value) for value in values)
        return tuple(
            sum(float(value[index]) for value in values) / len(values)
            for index in range(width)
        )

    @property
    def is_on(self) -> bool | None:
        status = self.manager.status(self.group_id)
        state = status.get("desired_state") or status.get("state")
        return True if state == "on" else False if state == "off" else None

    @property
    def available(self) -> bool:
        states = self._member_states()
        return bool(states) and any(state.state != "unavailable" for state in states)

    @property
    def assumed_state(self) -> bool:
        """Match native Light Group assumed-state behavior."""
        return any(
            bool(state.attributes.get(ATTR_ASSUMED_STATE))
            for state in self._member_states()
        )

    @property
    def brightness(self) -> int | None:
        value = self._mean_numeric(self._on_member_states(), LightEntityStateAttribute.BRIGHTNESS)
        return int(value) if value is not None else None

    @property
    def color_temp_kelvin(self) -> int | None:
        value = self._mean_numeric(
            self._on_member_states(), LightEntityStateAttribute.COLOR_TEMP_KELVIN
        )
        return int(value) if value is not None else None

    @property
    def hs_color(self) -> tuple[float, float] | None:
        values = [
            state.attributes.get(LightEntityStateAttribute.HS_COLOR)
            for state in self._on_member_states()
        ]
        values = [
            value
            for value in values
            if isinstance(value, (list, tuple)) and len(value) == 2
        ]
        if not values:
            return None
        from math import atan2, cos, degrees, radians, sin

        sum_x = sum(cos(radians(float(value[0]))) for value in values)
        sum_y = sum(sin(radians(float(value[0]))) for value in values)
        hue = degrees(atan2(sum_y, sum_x)) % 360
        saturation = sum(float(value[1]) for value in values) / len(values)
        return (hue, saturation)

    @property
    def rgb_color(self) -> tuple[int, int, int] | None:
        value = self._mean_tuple(self._on_member_states(), LightEntityStateAttribute.RGB_COLOR)
        return value if value and len(value) == 3 else None

    @property
    def rgbw_color(self) -> tuple[int, int, int, int] | None:
        value = self._mean_tuple(self._on_member_states(), LightEntityStateAttribute.RGBW_COLOR)
        return value if value and len(value) == 4 else None

    @property
    def rgbww_color(self) -> tuple[int, int, int, int, int] | None:
        value = self._mean_tuple(self._on_member_states(), LightEntityStateAttribute.RGBWW_COLOR)
        return value if value and len(value) == 5 else None

    @property
    def xy_color(self) -> tuple[float, float] | None:
        value = self._mean_tuple(self._on_member_states(), LightEntityStateAttribute.XY_COLOR)
        return value if value and len(value) == 2 else None

    @property
    def effect(self) -> str | None:
        values = [
            state.attributes.get(LightEntityStateAttribute.EFFECT)
            for state in self._on_member_states()
            if state.attributes.get(LightEntityStateAttribute.EFFECT) is not None
        ]
        return Counter(values).most_common(1)[0][0] if values else None

    @property
    def effect_list(self) -> list[str] | None:
        effects: set[str] = set()
        for state in self._member_states():
            value = state.attributes.get(LightEntityCapabilityAttribute.EFFECT_LIST)
            if isinstance(value, (list, tuple, set)):
                effects.update(str(item) for item in value)
        return sorted(effects) if effects else None

    @property
    def min_color_temp_kelvin(self) -> int:
        values = [
            state.attributes.get(LightEntityCapabilityAttribute.MIN_COLOR_TEMP_KELVIN)
            for state in self._member_states()
        ]
        values = [int(value) for value in values if isinstance(value, (int, float))]
        return min(values) if values else 2000

    @property
    def max_color_temp_kelvin(self) -> int:
        values = [
            state.attributes.get(LightEntityCapabilityAttribute.MAX_COLOR_TEMP_KELVIN)
            for state in self._member_states()
        ]
        values = [int(value) for value in values if isinstance(value, (int, float))]
        return max(values) if values else 6500

    @property
    def supported_color_modes(self) -> set[ColorMode]:
        modes: set[ColorMode] = set()
        for state in self._member_states():
            for mode in state.attributes.get(
                LightEntityCapabilityAttribute.SUPPORTED_COLOR_MODES, []
            ) or []:
                try:
                    modes.add(ColorMode(mode))
                except ValueError:
                    continue
        return filter_supported_color_modes(modes) if modes else {ColorMode.ONOFF}

    @property
    def color_mode(self) -> ColorMode:
        modes = [
            state.attributes.get(LightEntityStateAttribute.COLOR_MODE)
            for state in self._on_member_states()
            if state.attributes.get(LightEntityStateAttribute.COLOR_MODE)
        ]
        if not modes:
            return ColorMode.UNKNOWN

        counts = Counter(modes)
        supported = self.supported_color_modes
        if ColorMode.ONOFF in counts:
            if ColorMode.ONOFF in supported:
                counts[ColorMode.ONOFF] = -1
            else:
                counts.pop(ColorMode.ONOFF)
        if ColorMode.BRIGHTNESS in counts:
            if ColorMode.BRIGHTNESS in supported:
                counts[ColorMode.BRIGHTNESS] = 0
            else:
                counts.pop(ColorMode.BRIGHTNESS)
        if not counts:
            return next(iter(supported))
        try:
            return ColorMode(counts.most_common(1)[0][0])
        except ValueError:
            return next(iter(supported))

    @property
    def supported_features(self) -> LightEntityFeature:
        supported = LightEntityFeature(0)
        for state in self._member_states():
            try:
                supported |= LightEntityFeature(
                    int(state.attributes.get(EntityStateAttribute.SUPPORTED_FEATURES, 0))
                )
            except (TypeError, ValueError):
                continue
        return supported & (
            LightEntityFeature.EFFECT
            | LightEntityFeature.FLASH
            | LightEntityFeature.TRANSITION
        )

    async def async_turn_on(self, **kwargs: Any) -> None:
        forwarded = {
            key: value
            for key, value in kwargs.items()
            if key
            in {
                ATTR_BRIGHTNESS,
                ATTR_COLOR_TEMP_KELVIN,
                ATTR_EFFECT,
                ATTR_FLASH,
                ATTR_HS_COLOR,
                ATTR_RGB_COLOR,
                ATTR_RGBW_COLOR,
                ATTR_RGBWW_COLOR,
                ATTR_TRANSITION,
                ATTR_WHITE,
                ATTR_XY_COLOR,
            }
        }
        await self.manager.async_set_state(
            self.group_id,
            "on",
            source=self.entity_id or "smart_group",
            origin="virtual",
            service_data=forwarded or None,
        )

    async def async_turn_off(self, **kwargs: Any) -> None:
        forwarded = (
            {ATTR_TRANSITION: kwargs[ATTR_TRANSITION]}
            if ATTR_TRANSITION in kwargs
            else None
        )
        await self.manager.async_set_state(
            self.group_id,
            "off",
            source=self.entity_id or "smart_group",
            origin="virtual",
            service_data=forwarded,
        )
