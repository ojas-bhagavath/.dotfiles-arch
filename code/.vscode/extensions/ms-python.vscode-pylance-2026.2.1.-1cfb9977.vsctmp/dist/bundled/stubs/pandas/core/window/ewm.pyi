from typing import (
    Any,
    overload,
)

from pandas import (
    DataFrame,
    Series,
)
from pandas.core.window.rolling import (
    BaseWindow,
    BaseWindowGroupby,
)

from pandas._typing import (
    NDFrameT,
    WindowingEngine,
    WindowingEngineKwargs,
)

class ExponentialMovingWindow(BaseWindow[NDFrameT]):
    def mean(
        self,
        numeric_only: bool = False,
        engine: WindowingEngine = None,
        engine_kwargs: WindowingEngineKwargs = None,
    ) -> NDFrameT:
        """
Calculate the ewm (exponential weighted moment) mean.

Parameters
----------
numeric_only : bool, default False
    Include only float, int, boolean columns.

    .. versionadded:: 1.5.0

engine : str, default None
    * ``'cython'`` : Runs the operation through C-extensions from cython.
    * ``'numba'`` : Runs the operation through JIT compiled code from numba.
    * ``None`` : Defaults to ``'cython'`` or globally setting ``compute.use_numba``

      .. versionadded:: 1.3.0

engine_kwargs : dict, default None
    * For ``'cython'`` engine, there are no accepted ``engine_kwargs``
    * For ``'numba'`` engine, the engine can accept ``nopython``, ``nogil``
      and ``parallel`` dictionary keys. The values must either be ``True`` or
      ``False``. The default ``engine_kwargs`` for the ``'numba'`` engine is
      ``{'nopython': True, 'nogil': False, 'parallel': False}``

      .. versionadded:: 1.3.0

Returns
-------
Series or DataFrame
    Return type is the same as the original object with ``np.float64`` dtype.

See Also
--------
pandas.Series.ewm : Calling ewm with Series data.
pandas.DataFrame.ewm : Calling ewm with DataFrames.
pandas.Series.mean : Aggregating mean for Series.
pandas.DataFrame.mean : Aggregating mean for DataFrame.

Notes
-----
See :ref:`window.numba_engine` and :ref:`enhancingperf.numba` for extended documentation and performance considerations for the Numba engine.

Examples
--------
>>> ser = pd.Series([1, 2, 3, 4])
>>> ser.ewm(alpha=.2).mean()
0    1.000000
1    1.555556
2    2.147541
3    2.775068
dtype: float64
        """
        pass
    def sum(
        self,
        numeric_only: bool = False,
        engine: WindowingEngine = None,
        engine_kwargs: WindowingEngineKwargs = None,
    ) -> NDFrameT:
        """
Calculate the ewm (exponential weighted moment) sum.

Parameters
----------
numeric_only : bool, default False
    Include only float, int, boolean columns.

    .. versionadded:: 1.5.0

engine : str, default None
    * ``'cython'`` : Runs the operation through C-extensions from cython.
    * ``'numba'`` : Runs the operation through JIT compiled code from numba.
    * ``None`` : Defaults to ``'cython'`` or globally setting ``compute.use_numba``

      .. versionadded:: 1.3.0

engine_kwargs : dict, default None
    * For ``'cython'`` engine, there are no accepted ``engine_kwargs``
    * For ``'numba'`` engine, the engine can accept ``nopython``, ``nogil``
      and ``parallel`` dictionary keys. The values must either be ``True`` or
      ``False``. The default ``engine_kwargs`` for the ``'numba'`` engine is
      ``{'nopython': True, 'nogil': False, 'parallel': False}``

      .. versionadded:: 1.3.0

Returns
-------
Series or DataFrame
    Return type is the same as the original object with ``np.float64`` dtype.

See Also
--------
pandas.Series.ewm : Calling ewm with Series data.
pandas.DataFrame.ewm : Calling ewm with DataFrames.
pandas.Series.sum : Aggregating sum for Series.
pandas.DataFrame.sum : Aggregating sum for DataFrame.

Notes
-----
See :ref:`window.numba_engine` and :ref:`enhancingperf.numba` for extended documentation and performance considerations for the Numba engine.

Examples
--------
>>> ser = pd.Series([1, 2, 3, 4])
>>> ser.ewm(alpha=.2).sum()
0    1.000
1    2.800
2    5.240
3    8.192
dtype: float64
        """
        pass
    def std(self, bias: bool = False, numeric_only: bool = False) -> NDFrameT:
        """
Calculate the ewm (exponential weighted moment) standard deviation.

Parameters
----------
bias : bool, default False
    Use a standard estimation bias correction.
numeric_only : bool, default False
    Include only float, int, boolean columns.

    .. versionadded:: 1.5.0

Returns
-------
Series or DataFrame
    Return type is the same as the original object with ``np.float64`` dtype.

See Also
--------
pandas.Series.ewm : Calling ewm with Series data.
pandas.DataFrame.ewm : Calling ewm with DataFrames.
pandas.Series.std : Aggregating std for Series.
pandas.DataFrame.std : Aggregating std for DataFrame.

Examples
--------
>>> ser = pd.Series([1, 2, 3, 4])
>>> ser.ewm(alpha=.2).std()
0         NaN
1    0.707107
2    0.995893
3    1.277320
dtype: float64
        """
        pass
    def var(self, bias: bool = False, numeric_only: bool = False) -> NDFrameT:
        """
Calculate the ewm (exponential weighted moment) variance.

Parameters
----------
bias : bool, default False
    Use a standard estimation bias correction.
numeric_only : bool, default False
    Include only float, int, boolean columns.

    .. versionadded:: 1.5.0

Returns
-------
Series or DataFrame
    Return type is the same as the original object with ``np.float64`` dtype.

See Also
--------
pandas.Series.ewm : Calling ewm with Series data.
pandas.DataFrame.ewm : Calling ewm with DataFrames.
pandas.Series.var : Aggregating var for Series.
pandas.DataFrame.var : Aggregating var for DataFrame.

Examples
--------
>>> ser = pd.Series([1, 2, 3, 4])
>>> ser.ewm(alpha=.2).var()
0         NaN
1    0.500000
2    0.991803
3    1.631547
dtype: float64
        """
        pass
    def cov(
        self,
        other: DataFrame | Series | None = None,
        pairwise: bool | None = None,
        bias: bool = False,
        numeric_only: bool = False,
    ) -> NDFrameT:
        """
Calculate the ewm (exponential weighted moment) sample covariance.

Parameters
----------
other : Series or DataFrame , optional
    If not supplied then will default to self and produce pairwise
    output.
pairwise : bool, default None
    If False then only matching columns between self and other will be
    used and the output will be a DataFrame.
    If True then all pairwise combinations will be calculated and the
    output will be a MultiIndex DataFrame in the case of DataFrame
    inputs. In the case of missing elements, only complete pairwise
    observations will be used.
bias : bool, default False
    Use a standard estimation bias correction.
numeric_only : bool, default False
    Include only float, int, boolean columns.

    .. versionadded:: 1.5.0

Returns
-------
Series or DataFrame
    Return type is the same as the original object with ``np.float64`` dtype.

See Also
--------
pandas.Series.ewm : Calling ewm with Series data.
pandas.DataFrame.ewm : Calling ewm with DataFrames.
pandas.Series.cov : Aggregating cov for Series.
pandas.DataFrame.cov : Aggregating cov for DataFrame.

Examples
--------
>>> ser1 = pd.Series([1, 2, 3, 4])
>>> ser2 = pd.Series([10, 11, 13, 16])
>>> ser1.ewm(alpha=.2).cov(ser2)
0         NaN
1    0.500000
2    1.524590
3    3.408836
dtype: float64
        """
        pass
    def corr(
        self,
        other: DataFrame | Series | None = None,
        pairwise: bool | None = None,
        numeric_only: bool = False,
    ) -> NDFrameT:
        """
Calculate the ewm (exponential weighted moment) sample correlation.

Parameters
----------
other : Series or DataFrame, optional
    If not supplied then will default to self and produce pairwise
    output.
pairwise : bool, default None
    If False then only matching columns between self and other will be
    used and the output will be a DataFrame.
    If True then all pairwise combinations will be calculated and the
    output will be a MultiIndex DataFrame in the case of DataFrame
    inputs. In the case of missing elements, only complete pairwise
    observations will be used.
numeric_only : bool, default False
    Include only float, int, boolean columns.

    .. versionadded:: 1.5.0

Returns
-------
Series or DataFrame
    Return type is the same as the original object with ``np.float64`` dtype.

See Also
--------
pandas.Series.ewm : Calling ewm with Series data.
pandas.DataFrame.ewm : Calling ewm with DataFrames.
pandas.Series.corr : Aggregating corr for Series.
pandas.DataFrame.corr : Aggregating corr for DataFrame.

Examples
--------
>>> ser1 = pd.Series([1, 2, 3, 4])
>>> ser2 = pd.Series([10, 11, 13, 16])
>>> ser1.ewm(alpha=.2).corr(ser2)
0         NaN
1    1.000000
2    0.982821
3    0.977802
dtype: float64
        """
        pass
    @overload  # type: ignore[override]
    def aggregate(  # pyrefly: ignore[bad-override]
        self: BaseWindow[Series],
        func: str,
        *args: Any,
        **kwargs: Any,
    ) -> Series:
        """
Aggregate using one or more operations over the specified axis.

Parameters
----------
func : function, str, list or dict
    Function to use for aggregating the data. If a function, must either
    work when passed a Series/Dataframe or when passed to Series/Dataframe.apply.

    Accepted combinations are:

    - function
    - string function name
    - list of functions and/or function names, e.g. ``[np.sum, 'mean']``
    - dict of axis labels -> functions, function names or list of such.

*args
    Positional arguments to pass to `func`.
**kwargs
    Keyword arguments to pass to `func`.

Returns
-------
scalar, Series or DataFrame

    The return can be:

    * scalar : when Series.agg is called with single function
    * Series : when DataFrame.agg is called with a single function
    * DataFrame : when DataFrame.agg is called with several functions

See Also
--------
pandas.DataFrame.rolling.aggregate

Notes
-----
The aggregation operations are always performed over an axis, either the
index (default) or the column axis. This behavior is different from
`numpy` aggregation functions (`mean`, `median`, `prod`, `sum`, `std`,
`var`), where the default is to compute the aggregation of the flattened
array, e.g., ``numpy.mean(arr_2d)`` as opposed to
``numpy.mean(arr_2d, axis=0)``.

`agg` is an alias for `aggregate`. Use the alias.

Functions that mutate the passed object can produce unexpected
behavior or errors and are not supported. See :ref:`gotchas.udf-mutation`
for more details.

A passed user-defined-function will be passed a Series for evaluation.

Examples
--------
>>> df = pd.DataFrame({"A": [1, 2, 3], "B": [4, 5, 6], "C": [7, 8, 9]})
>>> df
   A  B  C
0  1  4  7
1  2  5  8
2  3  6  9

>>> df.ewm(alpha=0.5).mean()
          A         B         C
0  1.000000  4.000000  7.000000
1  1.666667  4.666667  7.666667
2  2.428571  5.428571  8.428571
        """
        pass
    @overload
    def aggregate(  # ty: ignore[invalid-method-override]  # pyright: ignore[reportIncompatibleMethodOverride]
        self: BaseWindow[DataFrame],
        func: str,
        *args: Any,
        **kwargs: Any,
    ) -> DataFrame: ...
    agg = aggregate  # type: ignore[assignment]  # ty: ignore[invalid-method-override]  # pyrefly: ignore[bad-override]

class ExponentialMovingWindowGroupby(
    BaseWindowGroupby[NDFrameT], ExponentialMovingWindow[NDFrameT]
): ...
