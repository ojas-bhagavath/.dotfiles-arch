from collections.abc import (
    Iterator,
    Sequence,
)
from typing import (
    Any,
    Self,
    TypeAlias,
    overload,
)

from pandas.core.arraylike import OpsMixin
from pandas.core.arrays._mixins import NDArrayBackedExtensionArray

from pandas._libs import (
    NaT as NaT,
    NaTType as NaTType,
)
from pandas._libs.tslibs.timedeltas import Timedelta
from pandas._libs.tslibs.timestamps import Timestamp
from pandas._typing import (
    AxisInt,
    DatetimeLikeScalar,
    Frequency,
    NpDtype,
    PositionalIndexerTuple,
    ScalarIndexer,
    SequenceIndexer,
    TimeAmbiguous,
    TimeNonexistent,
    TimeUnit,
    np_1darray,
    np_1darray_str,
)

DTScalarOrNaT: TypeAlias = DatetimeLikeScalar | NaTType

class DatelikeOps(DatetimeLikeArrayMixin):
    def strftime(self, date_format: str) -> np_1darray_str: ...

class TimelikeOps(DatetimeLikeArrayMixin):
    @property
    def unit(self) -> TimeUnit: ...
    def as_unit(self, unit: TimeUnit) -> Self: ...
    def round(
        self,
        freq: Frequency,
        ambiguous: TimeAmbiguous = "raise",
        nonexistent: TimeNonexistent = "raise",
    ) -> Self:
        """
Perform round operation on the data to the specified `freq`.

Parameters
----------
freq : str or Offset
    The frequency level to round the index to. Must be a fixed
    frequency like 'S' (second) not 'ME' (month end). See
    :ref:`frequency aliases <timeseries.offset_aliases>` for
    a list of possible `freq` values.
ambiguous : 'infer', bool-ndarray, 'NaT', default 'raise'
    Only relevant for DatetimeIndex:

    - 'infer' will attempt to infer fall dst-transition hours based on
      order
    - bool-ndarray where True signifies a DST time, False designates
      a non-DST time (note that this flag is only applicable for
      ambiguous times)
    - 'NaT' will return NaT where there are ambiguous times
    - 'raise' will raise an AmbiguousTimeError if there are ambiguous
      times.

nonexistent : 'shift_forward', 'shift_backward', 'NaT', timedelta, default 'raise'
    A nonexistent time does not exist in a particular timezone
    where clocks moved forward due to DST.

    - 'shift_forward' will shift the nonexistent time forward to the
      closest existing time
    - 'shift_backward' will shift the nonexistent time backward to the
      closest existing time
    - 'NaT' will return NaT where there are nonexistent times
    - timedelta objects will shift nonexistent times by the timedelta
    - 'raise' will raise an NonExistentTimeError if there are
      nonexistent times.

Returns
-------
DatetimeIndex, TimedeltaIndex, or Series
    Index of the same type for a DatetimeIndex or TimedeltaIndex,
    or a Series with the same index for a Series.

Raises
------
ValueError if the `freq` cannot be converted.

Notes
-----
If the timestamps have a timezone, rounding will take place relative to the
local ("wall") time and re-localized to the same timezone. When rounding
near daylight savings time, use ``nonexistent`` and ``ambiguous`` to
control the re-localization behavior.

Examples
--------
**DatetimeIndex**

>>> rng = pd.date_range('1/1/2018 11:59:00', periods=3, freq='min')
>>> rng
DatetimeIndex(['2018-01-01 11:59:00', '2018-01-01 12:00:00',
               '2018-01-01 12:01:00'],
              dtype='datetime64[ns]', freq='min')
>>> rng.round('h')
DatetimeIndex(['2018-01-01 12:00:00', '2018-01-01 12:00:00',
               '2018-01-01 12:00:00'],
              dtype='datetime64[ns]', freq=None)

**Series**

>>> pd.Series(rng).dt.round("h")
0   2018-01-01 12:00:00
1   2018-01-01 12:00:00
2   2018-01-01 12:00:00
dtype: datetime64[ns]

When rounding near a daylight savings time transition, use ``ambiguous`` or
``nonexistent`` to control how the timestamp should be re-localized.

>>> rng_tz = pd.DatetimeIndex(["2021-10-31 03:30:00"], tz="Europe/Amsterdam")

>>> rng_tz.floor("2h", ambiguous=False)
DatetimeIndex(['2021-10-31 02:00:00+01:00'],
              dtype='datetime64[ns, Europe/Amsterdam]', freq=None)

>>> rng_tz.floor("2h", ambiguous=True)
DatetimeIndex(['2021-10-31 02:00:00+02:00'],
              dtype='datetime64[ns, Europe/Amsterdam]', freq=None)
        """
        pass
    def floor(
        self,
        freq: Frequency,
        ambiguous: TimeAmbiguous = "raise",
        nonexistent: TimeNonexistent = "raise",
    ) -> Self:
        """
Perform floor operation on the data to the specified `freq`.

Parameters
----------
freq : str or Offset
    The frequency level to floor the index to. Must be a fixed
    frequency like 'S' (second) not 'ME' (month end). See
    :ref:`frequency aliases <timeseries.offset_aliases>` for
    a list of possible `freq` values.
ambiguous : 'infer', bool-ndarray, 'NaT', default 'raise'
    Only relevant for DatetimeIndex:

    - 'infer' will attempt to infer fall dst-transition hours based on
      order
    - bool-ndarray where True signifies a DST time, False designates
      a non-DST time (note that this flag is only applicable for
      ambiguous times)
    - 'NaT' will return NaT where there are ambiguous times
    - 'raise' will raise an AmbiguousTimeError if there are ambiguous
      times.

nonexistent : 'shift_forward', 'shift_backward', 'NaT', timedelta, default 'raise'
    A nonexistent time does not exist in a particular timezone
    where clocks moved forward due to DST.

    - 'shift_forward' will shift the nonexistent time forward to the
      closest existing time
    - 'shift_backward' will shift the nonexistent time backward to the
      closest existing time
    - 'NaT' will return NaT where there are nonexistent times
    - timedelta objects will shift nonexistent times by the timedelta
    - 'raise' will raise an NonExistentTimeError if there are
      nonexistent times.

Returns
-------
DatetimeIndex, TimedeltaIndex, or Series
    Index of the same type for a DatetimeIndex or TimedeltaIndex,
    or a Series with the same index for a Series.

Raises
------
ValueError if the `freq` cannot be converted.

Notes
-----
If the timestamps have a timezone, flooring will take place relative to the
local ("wall") time and re-localized to the same timezone. When flooring
near daylight savings time, use ``nonexistent`` and ``ambiguous`` to
control the re-localization behavior.

Examples
--------
**DatetimeIndex**

>>> rng = pd.date_range('1/1/2018 11:59:00', periods=3, freq='min')
>>> rng
DatetimeIndex(['2018-01-01 11:59:00', '2018-01-01 12:00:00',
               '2018-01-01 12:01:00'],
              dtype='datetime64[ns]', freq='min')
>>> rng.floor('h')
DatetimeIndex(['2018-01-01 11:00:00', '2018-01-01 12:00:00',
               '2018-01-01 12:00:00'],
              dtype='datetime64[ns]', freq=None)

**Series**

>>> pd.Series(rng).dt.floor("h")
0   2018-01-01 11:00:00
1   2018-01-01 12:00:00
2   2018-01-01 12:00:00
dtype: datetime64[ns]

When rounding near a daylight savings time transition, use ``ambiguous`` or
``nonexistent`` to control how the timestamp should be re-localized.

>>> rng_tz = pd.DatetimeIndex(["2021-10-31 03:30:00"], tz="Europe/Amsterdam")

>>> rng_tz.floor("2h", ambiguous=False)
DatetimeIndex(['2021-10-31 02:00:00+01:00'],
             dtype='datetime64[ns, Europe/Amsterdam]', freq=None)

>>> rng_tz.floor("2h", ambiguous=True)
DatetimeIndex(['2021-10-31 02:00:00+02:00'],
              dtype='datetime64[ns, Europe/Amsterdam]', freq=None)
        """
        pass
    def ceil(
        self,
        freq: Frequency,
        ambiguous: TimeAmbiguous = "raise",
        nonexistent: TimeNonexistent = "raise",
    ) -> Self:
        """
Perform ceil operation on the data to the specified `freq`.

Parameters
----------
freq : str or Offset
    The frequency level to ceil the index to. Must be a fixed
    frequency like 'S' (second) not 'ME' (month end). See
    :ref:`frequency aliases <timeseries.offset_aliases>` for
    a list of possible `freq` values.
ambiguous : 'infer', bool-ndarray, 'NaT', default 'raise'
    Only relevant for DatetimeIndex:

    - 'infer' will attempt to infer fall dst-transition hours based on
      order
    - bool-ndarray where True signifies a DST time, False designates
      a non-DST time (note that this flag is only applicable for
      ambiguous times)
    - 'NaT' will return NaT where there are ambiguous times
    - 'raise' will raise an AmbiguousTimeError if there are ambiguous
      times.

nonexistent : 'shift_forward', 'shift_backward', 'NaT', timedelta, default 'raise'
    A nonexistent time does not exist in a particular timezone
    where clocks moved forward due to DST.

    - 'shift_forward' will shift the nonexistent time forward to the
      closest existing time
    - 'shift_backward' will shift the nonexistent time backward to the
      closest existing time
    - 'NaT' will return NaT where there are nonexistent times
    - timedelta objects will shift nonexistent times by the timedelta
    - 'raise' will raise an NonExistentTimeError if there are
      nonexistent times.

Returns
-------
DatetimeIndex, TimedeltaIndex, or Series
    Index of the same type for a DatetimeIndex or TimedeltaIndex,
    or a Series with the same index for a Series.

Raises
------
ValueError if the `freq` cannot be converted.

Notes
-----
If the timestamps have a timezone, ceiling will take place relative to the
local ("wall") time and re-localized to the same timezone. When ceiling
near daylight savings time, use ``nonexistent`` and ``ambiguous`` to
control the re-localization behavior.

Examples
--------
**DatetimeIndex**

>>> rng = pd.date_range('1/1/2018 11:59:00', periods=3, freq='min')
>>> rng
DatetimeIndex(['2018-01-01 11:59:00', '2018-01-01 12:00:00',
               '2018-01-01 12:01:00'],
              dtype='datetime64[ns]', freq='min')
>>> rng.ceil('h')
DatetimeIndex(['2018-01-01 12:00:00', '2018-01-01 12:00:00',
               '2018-01-01 13:00:00'],
              dtype='datetime64[ns]', freq=None)

**Series**

>>> pd.Series(rng).dt.ceil("h")
0   2018-01-01 12:00:00
1   2018-01-01 12:00:00
2   2018-01-01 13:00:00
dtype: datetime64[ns]

When rounding near a daylight savings time transition, use ``ambiguous`` or
``nonexistent`` to control how the timestamp should be re-localized.

>>> rng_tz = pd.DatetimeIndex(["2021-10-31 01:30:00"], tz="Europe/Amsterdam")

>>> rng_tz.ceil("h", ambiguous=False)
DatetimeIndex(['2021-10-31 02:00:00+01:00'],
              dtype='datetime64[ns, Europe/Amsterdam]', freq=None)

>>> rng_tz.ceil("h", ambiguous=True)
DatetimeIndex(['2021-10-31 02:00:00+02:00'],
              dtype='datetime64[ns, Europe/Amsterdam]', freq=None)
        """
        pass

class DatetimeLikeArrayMixin(OpsMixin, NDArrayBackedExtensionArray):
    @property
    def ndim(self) -> int: ...
    def reshape(self, *args: Any, **kwargs: Any) -> Self: ...
    def __iter__(self) -> Iterator[Any]: ...
    @property
    def nbytes(self) -> int: ...
    def __array__(
        self, dtype: NpDtype | None = None, copy: bool | None = None
    ) -> np_1darray: ...
    @property
    def size(self) -> int: ...
    @overload
    def __getitem__(  # pyrefly: ignore[bad-override]
        self, key: ScalarIndexer
    ) -> DTScalarOrNaT: ...
    @overload
    def __getitem__(  # ty: ignore[invalid-method-override]
        self, key: SequenceIndexer | PositionalIndexerTuple
    ) -> Self: ...
    def __setitem__(  # type: ignore[override] # pyright: ignore[reportIncompatibleMethodOverride] # pyrefly: ignore[bad-override] # ty: ignore[invalid-method-override]
        self, key: int | Sequence[int] | Sequence[bool] | slice, value: Any
    ) -> None: ...
    # TODO: pandas-dev/pandas-stubs#1589 import testing
    # def view(self, dtype: DtypeArg | None = None) -> np_ndarray: ...
    @property
    def freq(self) -> Frequency | None: ...
    @freq.setter
    def freq(self, value: Frequency) -> None: ...
    @property
    def freqstr(self) -> str | None: ...
    @property
    def inferred_freq(self) -> str | None: ...
    @property
    def resolution(self) -> str: ...
    # TODO: pandas-dev/pandas-stubs#1589 add testing for the below
    def __sub__(self, other: Any) -> Any: ...
    def __rsub__(self, other: Any) -> Any: ...
    def __iadd__(self, other: Any) -> Self: ...
    def __isub__(self, other: Any) -> Self: ...
    def min(
        self, *, axis: AxisInt | None = None, skipna: bool = True, **kwargs: Any
    ) -> Timestamp | Timedelta | NaTType: ...
    def max(
        self, *, axis: AxisInt | None = None, skipna: bool = True, **kwargs: Any
    ) -> Timestamp | Timedelta | NaTType: ...
    def mean(self, *, skipna: bool = True) -> Timestamp | Timedelta | NaTType: ...
